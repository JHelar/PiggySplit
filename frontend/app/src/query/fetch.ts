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

export async function fetchRaw(path: string, options: FetchOptions) {
	const url = buildApiUrl(path);
	console.log(process.env.EXPO_PUBLIC_API_URL);
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

	const response = await fetch(url, options);
	if (!response.ok) {
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
