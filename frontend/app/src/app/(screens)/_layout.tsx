import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { AuthState, useAuth } from "@/auth";
import { ScreenLayout } from "@/components/ScreenLayout";
import { GroupRouteOptions } from "@/screens/Group";
import { GroupInviteRouteOptions } from "@/screens/GroupInvite";
import { GroupsRouteOptions } from "@/screens/Groups";
import { HomeRouteOptions } from "@/screens/Home";
import { PayRouteOptions } from "@/screens/Pay";
import { ProfileRouteOptions } from "@/screens/Profile";
import type { RenderSlot } from "@/ui/utils/renderSlot";

SystemUI.setBackgroundColorAsync(
	UnistylesRuntime.getTheme().background.primary,
);

export default function ScreenLayoutRoot() {
	const authState = useAuth(({ state }) => state);
	const { theme } = useUnistyles();

	return (
		<Stack
			screenOptions={{
				headerTransparent: true,
				headerTintColor: theme.text.color.default,
				headerTitle: "",
			}}
			screenLayout={({ children, options }) => {
				return (
					<ScreenLayout
						variant="primary"
						footer={options.unstable_sheetFooter?.() as RenderSlot}
					>
						{children}
					</ScreenLayout>
				);
			}}
		>
			<Stack.Protected guard={authState === AuthState.UNAUTHORIZED}>
				<Stack.Screen name="index" options={HomeRouteOptions} />
			</Stack.Protected>
			<Stack.Protected guard={authState === AuthState.AUTHORIZED}>
				<Stack.Screen name="Groups/index" options={GroupsRouteOptions} />
				<Stack.Screen name="User/index" options={ProfileRouteOptions} />
				<Stack.Screen
					name="Groups/[groupId]/index"
					options={GroupRouteOptions}
				/>
				<Stack.Screen name="Groups/[groupId]/Pay" options={PayRouteOptions} />
			</Stack.Protected>
			<Stack.Protected guard={authState !== AuthState.INITIALIZING}>
				<Stack.Screen
					name="Groups/[groupId]/Invite"
					options={GroupInviteRouteOptions}
				/>
			</Stack.Protected>
		</Stack>
	);
}
