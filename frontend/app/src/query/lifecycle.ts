import { updateTokens, useAuth } from "@/auth/auth.store";
import type { FetchOptions } from "./fetch.types";

const REFRESH_HEADER = "PS-Refresh";
const TOKEN_HEADER = "PS-Token";

export function getAuthHeaders() {
	const state = useAuth.getState();
	if (state.accessToken && state.refreshToken) {
		return {
			Authorization: `Bearer ${state.accessToken}`,
			[REFRESH_HEADER]: state.refreshToken,
		};
	}
}

export function prepareAuthHeaders(options: FetchOptions) {
	return {
		...(options.headers ?? {}),
		...getAuthHeaders(),
	};
}

export function checkAuthResponse(response: Response) {
	const refreshToken = response.headers.get(REFRESH_HEADER);
	const accessToken = response.headers.get(TOKEN_HEADER);
	if (refreshToken && accessToken) {
		updateTokens({
			refreshToken,
			accessToken,
		});
	}
}
