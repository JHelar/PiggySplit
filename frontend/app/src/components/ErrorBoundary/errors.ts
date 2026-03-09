import { router } from "expo-router";
import type { ReactNode } from "react";
import { signOut } from "@/api/user";
import { queryClient } from "@/query";

export interface ErrorBoundaryError {
	handle(reset: () => void): ReactNode;
}

export function isErrorBoundaryError(
	error: unknown,
): error is ErrorBoundaryError {
	if (error instanceof NetworkError) {
		return true;
	}
	return false;
}

export class NetworkError extends Error implements ErrorBoundaryError {
	public static Codes = {
		UNAUTHORIZED: 401,
	};

	constructor(
		public statusCode: number,
		error: Error,
	) {
		super(`[NetworkError (${statusCode})] ${error.message}`, { cause: error });
	}

	public handle(reset: () => void): ReactNode {
		if (this.statusCode === NetworkError.Codes.UNAUTHORIZED) {
			queryClient
				.getMutationCache()
				.build(queryClient, signOut())
				.execute()
				.finally(() => {
					reset();
					router.replace("/");
				});
		}
		return null;
	}
}
