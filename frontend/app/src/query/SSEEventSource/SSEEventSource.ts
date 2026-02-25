import type { ZodType } from "zod";
import { getAuthHeaders } from "@/auth/auth.store";
import { assertIsError } from "@/utils/asserts";
import { includes } from "@/utils/includes";
import type {
	EventSourceEvent,
	EventSourceListener,
	EventSourceOptions,
	EventType,
} from "./SSEEventSource.types";

const XMLReadyStateMap = [
	"UNSENT",
	"OPENED",
	"HEADERS_RECEIVED",
	"LOADING",
	"DONE",
] as const;

/**
 * Copied and modified implementation from [react-native-sse](https://github.com/binaryminds/react-native-sse/tree/master) package
 */
export class SSEEventSource<
	const Resolvers extends Record<CustomEvent, ZodType>,
	CustomEvent extends keyof Resolvers & string,
> {
	ERROR = -1;
	CONNECTING = 0;
	OPEN = 1;
	CLOSED = 2;

	CRLF = "\r\n";
	LF = "\n";
	CR = "\r";

	private lastEventId: string | null;
	private status: number;
	private eventHandlers: Record<
		EventType<CustomEvent>,
		EventSourceListener<Resolvers, CustomEvent>[]
	>;

	private method: string;
	private timeout: number;
	private withCredentials: boolean;
	private body: any;
	private debug: boolean;
	private interval: number;
	private lineEndingCharacter: string | null;
	private timeoutBeforeConnection: number;
	private url: string;
	private headers: Record<string, string>;
	private eventSchemas: Resolvers;

	private _xhr: XMLHttpRequest | null;
	private _pollTimer: number | null;
	private _lastIndexProcessed: number;

	constructor(
		url: URL | string,
		options: EventSourceOptions<Resolvers, CustomEvent>,
	) {
		this.lastEventId = null;
		this.status = this.CONNECTING;

		this.eventHandlers = {
			open: [],
			message: [],
			error: [],
			done: [],
			close: [],
		} as Record<
			EventType<CustomEvent>,
			EventSourceListener<Resolvers, CustomEvent>[]
		>;

		this.method = options.method || "GET";
		this.timeout = options.timeout ?? 0;
		this.timeoutBeforeConnection = options.timeoutBeforeConnection ?? 500;
		this.withCredentials = options.withCredentials || false;
		this.body = options.body || undefined;
		this.debug = options.debug || false;
		this.interval = options.pollingInterval ?? 5000;
		this.lineEndingCharacter = options.lineEndingCharacter || null;
		this.eventSchemas = options.events;

		const defaultHeaders: Record<string, string> = {
			Accept: "text/event-stream",
			"Cache-Control": "no-cache",
			"X-Requested-With": "XMLHttpRequest",
		};

		this.headers = {
			...defaultHeaders,
			...options.headers,
		};

		this._xhr = null;
		this._pollTimer = null;
		this._lastIndexProcessed = 0;

		if (
			!url ||
			(typeof url !== "string" && typeof url.toString !== "function")
		) {
			throw new SyntaxError("[EventSource] Invalid URL argument.");
		}

		if (url instanceof URL) {
			this.url = url.toString();
		} else {
			this.url = url;
		}

		this._pollAgain(this.timeoutBeforeConnection, true);
	}

	_pollAgain(time: number, allowZero: boolean) {
		if (time > 0 || allowZero) {
			this._logDebug(`[EventSource] Will open new connection in ${time} ms.`);
			this._pollTimer = setTimeout(() => {
				this.open();
			}, time);
		}
	}

	open() {
		try {
			this.status = this.CONNECTING;

			this._lastIndexProcessed = 0;

			this._xhr = new XMLHttpRequest();
			this._xhr.open(this.method, this.url, true);

			if (this.withCredentials) {
				this._xhr.withCredentials = true;
			}

			for (const [key, value] of Object.entries(this.headers)) {
				if (value !== undefined && value !== null) {
					this._xhr.setRequestHeader(key, value);
				}
			}
			const authHeaders = getAuthHeaders();
			if (authHeaders) {
				for (const [key, value] of Object.entries(authHeaders)) {
					this._xhr.setRequestHeader(key, value);
				}
			}

			if (this.lastEventId !== null) {
				this._xhr.setRequestHeader("Last-Event-ID", this.lastEventId);
			}

			this._xhr.timeout = this.timeout;

			this._xhr.onreadystatechange = () => {
				if (this.status === this.CLOSED) {
					return;
				}

				const xhr = this._xhr!;

				this._logDebug(
					`[EventSource][onreadystatechange] ReadyState: ${XMLReadyStateMap[xhr.readyState] || "Unknown"}(${
						xhr.readyState
					}), status: ${xhr.status}`,
				);

				if (
					!includes(
						[XMLHttpRequest.DONE, XMLHttpRequest.LOADING],
						xhr.readyState,
					)
				) {
					return;
				}

				if (xhr.status >= 200 && xhr.status < 400) {
					if (this.status === this.CONNECTING) {
						this.status = this.OPEN;
						this.dispatch("open", { type: "open" });
						this._logDebug(
							"[EventSource][onreadystatechange][OPEN] Connection opened.",
						);
					}

					this._handleEvent(xhr.responseText || "");

					if (xhr.readyState === XMLHttpRequest.DONE) {
						this._logDebug(
							"[EventSource][onreadystatechange][DONE] Operation done.",
						);
						this._pollAgain(this.interval, false);
						this.dispatch("done", { type: "done" });
					}
				} else if (xhr.status !== 0) {
					this.status = this.ERROR;
					this.dispatch("error", {
						type: "error",
						message: xhr.responseText,
						xhrStatus: xhr.status,
						xhrState: xhr.readyState,
					});

					if (xhr.readyState === XMLHttpRequest.DONE) {
						this._logDebug(
							"[EventSource][onreadystatechange][ERROR] Response status error.",
						);
						this._pollAgain(this.interval, false);
					}
				}
			};

			this._xhr.onerror = () => {
				if (this.status === this.CLOSED) {
					return;
				}

				const xhr = this._xhr!;

				this.status = this.ERROR;
				this.dispatch("error", {
					type: "error",
					message: xhr.responseText,
					xhrStatus: xhr.status,
					xhrState: xhr.readyState,
				});
			};

			if (this.body) {
				this._xhr.send(this.body);
			} else {
				this._xhr.send();
			}

			if (this.timeout > 0) {
				setTimeout(() => {
					if (this._xhr?.readyState === XMLHttpRequest.LOADING) {
						this.dispatch("error", { type: "timeout" });
						this.close();
					}
				}, this.timeout);
			}
		} catch (error) {
			assertIsError(error);

			this.status = this.ERROR;
			this.dispatch("error", {
				type: "exception",
				message: error.message,
				error,
			});
		}
	}

	_logDebug(...msg: Parameters<(typeof console)["debug"]>) {
		if (this.debug) {
			console.debug(...msg);
		}
	}

	_handleEvent(response: string) {
		if (response === "") {
			console.log(`SSEResponse: "${response}"`);
			return;
		}
		if (this.lineEndingCharacter === null) {
			const detectedNewlineChar = this._detectNewlineChar(response);
			if (detectedNewlineChar !== null) {
				this._logDebug(
					`[EventSource] Automatically detected lineEndingCharacter: ${JSON.stringify(
						detectedNewlineChar,
					).slice(1, -1)}`,
				);
				this.lineEndingCharacter = detectedNewlineChar;
			} else {
				console.warn(
					"[EventSource] Unable to identify the line ending character. Ensure your server delivers a standard line ending character: \\r\\n, \\n, \\r, or specify your custom character using the 'lineEndingCharacter' option.",
				);
				return;
			}
		}

		const indexOfDoubleNewline = this._getLastDoubleNewlineIndex(response);
		if (indexOfDoubleNewline <= this._lastIndexProcessed) {
			return;
		}

		const parts = response
			.substring(this._lastIndexProcessed, indexOfDoubleNewline)
			.split(this.lineEndingCharacter);

		this._lastIndexProcessed = indexOfDoubleNewline;

		let type: EventType<CustomEvent> | undefined = undefined;
		let id = null;
		let data = [];
		let retry = 0;
		let line = "";

		for (let i = 0; i < parts.length; i++) {
			line = parts[i].trim();
			if (line.startsWith("event")) {
				type = line.replace(/event:?\s*/, "") as EventType<CustomEvent>;
			} else if (line.startsWith("retry")) {
				retry = parseInt(line.replace(/retry:?\s*/, ""), 10);
				if (!isNaN(retry)) {
					this.interval = retry;
				}
			} else if (line.startsWith("data")) {
				data.push(line.replace(/data:?\s*/, ""));
			} else if (line.startsWith("id")) {
				id = line.replace(/id:?\s*/, "");
				if (id !== "") {
					this.lastEventId = id;
				} else {
					this.lastEventId = null;
				}
			} else if (line === "") {
				if (data.length > 0) {
					const dataString = data.join("\n");
					const eventType = type || "message";
					const event = {
						type: eventType,
						data: dataString,
						url: this.url,
						lastEventId: this.lastEventId,
					};

					if (eventType in this.eventSchemas) {
						try {
							const parseResult = this.eventSchemas[
								eventType as keyof Resolvers
							].safeParse(JSON.parse(dataString));

							if (parseResult.success) {
								event.data = parseResult.data as string; // Keeping sanity here;
							} else {
								this.dispatch("error", {
									type: "exception",
									message: parseResult.error.message,
									error: parseResult.error,
								});
							}
						} catch (error) {
							this.dispatch("error", {
								type: "exception",
								error: error as Error,
								message: (error as Error).message,
							});
						}
					}
					this.dispatch(
						eventType,
						event as EventSourceEvent<Resolvers, CustomEvent, CustomEvent>,
					);

					data = [];
					type = undefined;
				}
			}
		}
	}

	_detectNewlineChar(response: string) {
		const supportedLineEndings = [this.CRLF, this.LF, this.CR];
		for (const char of supportedLineEndings) {
			if (response.includes(char)) {
				return char;
			}
		}
		return null;
	}

	_getLastDoubleNewlineIndex(response: string) {
		const doubleLineEndingCharacter =
			this.lineEndingCharacter! + this.lineEndingCharacter!;
		const lastIndex = response.lastIndexOf(doubleLineEndingCharacter);
		if (lastIndex === -1) {
			return -1;
		}

		return lastIndex + doubleLineEndingCharacter.length;
	}

	addEventListener<T extends EventType<CustomEvent>>(
		type: T,
		listener: EventSourceListener<Resolvers, CustomEvent, T>,
	) {
		if (this.eventHandlers[type] === undefined) {
			this.eventHandlers[type] = [];
		}

		this.eventHandlers[type].push(
			listener as EventSourceListener<Resolvers, CustomEvent, T>,
		);
	}

	removeEventListener<T extends EventType<CustomEvent>>(
		type: T,
		listener: EventSourceListener<Resolvers, CustomEvent, T>,
	) {
		if (this.eventHandlers[type] !== undefined) {
			this.eventHandlers[type] = this.eventHandlers[type].filter(
				(handler) => handler !== listener,
			);
		}
	}

	removeAllEventListeners<T extends EventType<CustomEvent>>(type?: T) {
		const availableTypes = Object.keys(
			this.eventHandlers,
		) as EventType<CustomEvent>[];

		if (type === undefined) {
			for (const eventType of availableTypes) {
				this.eventHandlers[eventType] = [];
			}
		} else {
			if (!availableTypes.includes(type)) {
				throw Error(
					`[EventSource] '${type}' type is not supported event type.`,
				);
			}

			this.eventHandlers[type] = [];
		}
	}

	dispatch<T extends EventType<CustomEvent>>(
		type: T,
		data: EventSourceEvent<Resolvers, CustomEvent, T>,
	) {
		const availableTypes = Object.keys(this.eventHandlers);

		if (!availableTypes.includes(type)) {
			return;
		}

		for (const handler of Object.values(this.eventHandlers[type])) {
			handler(data as never);
		}
	}

	close() {
		if (this.status !== this.CLOSED) {
			this.status = this.CLOSED;
			this.dispatch("close", { type: "close" });
		}

		if (this._pollTimer) {
			clearTimeout(this._pollTimer);
		}
		if (this._xhr) {
			this._xhr.abort();
		}
	}
}
