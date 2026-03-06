import z from "zod";
import { getAuthHeaders, updateTokens } from "@/auth/auth.store";
import { NetworkError } from "@/components/ErrorBoundary";

const API_PATH = "api/v1";

export function buildApiUrl(path: string) {
	return new URL(
		`${API_PATH}/${path.replace(/^\//, "")}`,
		process.env.EXPO_PUBLIC_API_URL,
	);
}

type FetchOptions = {
	headers?: Record<string, string>;
	query?: Record<string, string>;
	method: "GET" | "POST" | "PATCH" | "DELETE";
} & Omit<NonNullable<Parameters<typeof fetch>[1]>, "headers">;

type FetchJSONOptions<Output extends z.ZodType | undefined> = FetchOptions & {
	output?: Output;
};

let fetchQueue: ((error?: Error) => void)[] = [];
let inflightRequests = 0;
export async function fetchRaw(path: string, options: FetchOptions) {
	const url = buildApiUrl(path);

	if (options.query) {
		Object.entries(options.query).forEach(([key, value]) =>
			url.searchParams.append(key, value),
		);
	}

	const authHeaders = getAuthHeaders();
	if (authHeaders) {
		options.headers = {
			...(options.headers ?? {}),
			...authHeaders,
		};
	}

	console.log("[START] Fetching", url.pathname);
	inflightRequests++;
	const response = await fetch(url, options);
	inflightRequests--;
	console.log("[END] Fetching", url.pathname);
	if (!response.ok) {
		if (response.status === 401) {
			// console.log(
			// 	"[STATUS] 401",
			// 	url.pathname,
			// 	fetchQueue.length,
			// 	inflightRequests,
			// );
			if (inflightRequests > 0) {
				return new Promise<Response>((resolve, reject) => {
					fetchQueue.push((error?: Error) => {
						if (error === undefined) {
							fetchRaw(path, options).then(resolve).catch(reject);
						} else {
							reject(error);
						}
					});
				});
			} else {
				const error = new NetworkError(
					response.status,
					new Error(`[Fetch] Unauthorized`),
				);

				fetchQueue.splice(0).forEach((rerunQuery) => {
					rerunQuery(error);
				});
				throw error;
			}
		}
		throw new NetworkError(
			response.status,
			new Error(`[Fetch] path(${path}) with message "${response.statusText}"`),
		);
	}
	const refreshToken = response.headers.get("PS-Refresh");
	const accessToken = response.headers.get("PS-Token");
	if (refreshToken && accessToken) {
		updateTokens({
			refreshToken,
			accessToken,
		});
		// console.log("[REFRESH] RERUN", url.pathname, fetchQueue.length, inflightRequests);
		requestAnimationFrame(() => {
			for (const rerunQuery of fetchQueue.splice(0)) {
				rerunQuery();
			}
		});
	}

	return response;
}

export async function fetchJSON<
	Output extends z.ZodType | undefined = undefined,
	Return = Output extends z.ZodType ? z.output<Output> : string,
>(
	path: string,
	{ output, ...options }: FetchJSONOptions<Output>,
): Promise<Return> {
	const headers = {
		...options.headers,
		"Content-Type": "application/json",
	};

	const response = await fetchRaw(path, {
		...options,
		headers,
	});

	if (output === undefined) return response.text() as Return;
	const json = await response.json();
	const result = output.safeParse(json);
	if (result.success) {
		return result.data as Return;
	}
	const errorMessage = z.formatError(result.error);
	console.error("Parse error:", errorMessage);
	console.error("Origin:", json);
	throw result.error;
}
