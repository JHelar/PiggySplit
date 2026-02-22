import type { RouteParams } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export type PayRouteParams = RouteParams<"/Groups/[groupId]/Pay">;

export const PayRouteOptions: ExtendedStackNavigationOptions = {
	headerBackVisible: true,
};
