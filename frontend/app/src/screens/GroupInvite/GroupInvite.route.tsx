import type { RouteParams } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export type GroupInviteRouteParams = RouteParams<"/Groups/[groupId]/Invite">;

export const GroupInviteRouteOptions: ExtendedStackNavigationOptions = {
	headerBackTitle: "Home",
	headerBackVisible: true,
};
