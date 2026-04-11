import type z from "zod";
import { NetworkError } from "@/components/ErrorBoundary";
import type { FetchJSONOptions, FetchOptions } from "./fetch.types";
import { checkAuthResponse, prepareAuthHeaders } from "./lifecycle";
import { withRetry } from "./withRetry";

const API_PATH = "api/v1";

export function buildApiUrl(path: string) {
	return new URL(
		`${API_PATH}/${path.replace(/^\//, "")}`,
		process.env.EXPO_PUBLIC_API_URL,
	);
}

export async function fetchRawInternal(path: string, options: FetchOptions) {
	const url = buildApiUrl(path);

	if (options.query) {
		Object.entries(options.query).forEach(([key, value]) =>
			url.searchParams.append(key, value),
		);
	}

	options.headers = prepareAuthHeaders(options);
	const response = await fetch(url, options);
	checkAuthResponse(response);

	if (!response.ok) {
		throw new NetworkError(
			response.status,
			new Error(`[Fetch] path(${path}) with message "${response.statusText}"`),
		);
	}

	return response;
}

export async function fetchJSONInternal<
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

	const response = await fetchRawInternal(path, {
		...options,
		headers,
	});

	if (output === undefined) return response.text() as Return;
	const json = await response.json();
	return output.parse(json) as Return;
}

export function fetchJSON<
	Output extends z.ZodType | undefined = undefined,
	Return = Output extends z.ZodType ? z.output<Output> : string,
>(path: string, options: FetchJSONOptions<Output>): Promise<Return> {
	return withRetry(() => fetchJSONInternal(path, options));
}

export function fetchRaw(path: string, options: FetchOptions) {
	return withRetry(() => fetchRawInternal(path, options));
}
