import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
	QueryClientProvider,
	useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UnistylesRuntime } from "react-native-unistyles";
import { AuthState, useAuth } from "@/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SnackbarRoot } from "@/components/SnackbarRoot";
import { queryClient } from "@/query";
import { GroupInviteRouteOptions } from "@/screens/GroupInvite";
import { SignInRouteOptions } from "@/screens/SignIn";

SystemUI.setBackgroundColorAsync(
	UnistylesRuntime.getTheme().background.primary,
);

const DefaultScreenOptions = {
	headerTransparent: true,
	headerTitle: "",
	headerTintColor: UnistylesRuntime.getTheme().text.color.default,
};

export default function AppLayout() {
	const { reset } = useQueryErrorResetBoundary();
	const authState = useAuth(({ state }) => state);

	return (
		<GestureHandlerRootView>
			<QueryClientProvider client={queryClient}>
				<I18nProvider i18n={i18n}>
					<ErrorBoundary queryReset={reset}>
						<Stack screenOptions={DefaultScreenOptions}>
							<Stack.Protected guard={authState === AuthState.AUTHORIZED}>
								<Stack.Screen name="(tabs)" />
							</Stack.Protected>
							<Stack.Protected guard={authState === AuthState.UNAUTHORIZED}>
								<Stack.Screen name="index" />
								<Stack.Screen name="SignIn" options={SignInRouteOptions} />
							</Stack.Protected>
							<Stack.Screen name="Invite" options={GroupInviteRouteOptions} />
						</Stack>
						<SnackbarRoot />
					</ErrorBoundary>
				</I18nProvider>
			</QueryClientProvider>
		</GestureHandlerRootView>
	);
}
