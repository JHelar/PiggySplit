import type z from "zod";

export type FetchOptions = {
	headers?: Record<string, string>;
	query?: Record<string, string>;
	method: "GET" | "POST" | "PATCH" | "DELETE";
} & Omit<NonNullable<Parameters<typeof fetch>[1]>, "headers">;

export type FetchJSONOptions<Output extends z.ZodType | undefined> =
	FetchOptions & {
		output?: Output;
	};
