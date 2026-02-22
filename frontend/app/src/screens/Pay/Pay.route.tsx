import type { RouteParams } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { UserContextMenu } from "@/components/ContextMenu";

export type PayRouteParams = RouteParams<"/Groups/[groupId]/Pay">;

export const PayRouteOptions: ExtendedStackNavigationOptions = {
	headerBackVisible: true,
	headerRight() {
		return <UserContextMenu />;
	},
};
