import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createUserStreamSource } from "@/api/stream";
import { getUser } from "@/api/user";
import { queryClient, type SSEEventSource } from "@/query";

export const AuthState = {
	INITIALIZING: "AuthState(INITIALIZING)",
	UNAUTHORIZED: "AuthState(UNAUTHORIZED)",
	AUTHORIZED: "AuthState(AUTHORIZED)",
} as const;

export type AuthState = typeof AuthState;

type AuthStoreState = {
	state: AuthState[keyof AuthState];
	accessToken?: string;
	refreshToken?: string;
	source?: SSEEventSource<any, any>;
};

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
	duration: 250,
	fade: true,
});

export const useAuth = create<AuthStoreState>()(
	persist(
		(set, get) => ({
			state: AuthState.INITIALIZING,
			accessToken: undefined,
			refreshToken: undefined,
		}),
		{
			name: "auth-store",
			storage: createJSONStorage(() => ({
				setItem: SecureStore.setItemAsync,
				getItem: SecureStore.getItemAsync,
				removeItem: SecureStore.deleteItemAsync,
			})),
			onRehydrateStorage() {
				return (state) => {
					if (state === undefined) return;

					if (state.accessToken) {
						queryClient
							.fetchQuery(getUser())
							.then((data) => {
								useAuth.setState({
									state: AuthState.AUTHORIZED,
									source: createUserStreamSource(),
								});
							})
							.catch(() => {
								useAuth.setState({
									state: AuthState.UNAUTHORIZED,
									accessToken: undefined,
								});
							})
							.finally(() => {
								SplashScreen.hideAsync();
							});
					} else {
						useAuth.setState({
							state: AuthState.UNAUTHORIZED,
							accessToken: undefined,
						});
						SplashScreen.hideAsync();
					}
				};
			},
			partialize(state) {
				return {
					accessToken: state.accessToken,
					refreshToken: state.refreshToken,
				};
			},
		},
	),
);

export function getAuthHeaders() {
	const state = useAuth.getState();
	if (state.accessToken && state.refreshToken) {
		return {
			Authorization: `Bearer ${state.accessToken}`,
			"PS-Refresh": state.refreshToken,
		};
	}
}

type UpdateTokensArguments = {
	accessToken: string;
	refreshToken: string;
};
export function updateTokens({
	accessToken,
	refreshToken,
}: UpdateTokensArguments) {
	useAuth.setState({
		accessToken,
		refreshToken,
	});
}

export function authorize() {
	useAuth.setState({
		state: AuthState.AUTHORIZED,
		source: createUserStreamSource(),
	});
	queryClient.prefetchQuery(getUser());
}

export function unauthorize() {
	useAuth.getState().source?.close();
	useAuth.setState({
		state: AuthState.UNAUTHORIZED,
		accessToken: undefined,
	});
}
