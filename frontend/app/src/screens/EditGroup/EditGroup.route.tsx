import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { RouteParams } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export type EditGroupRouteParams = RouteParams<"/Groups/[groupId]/Edit">;

const headerTitleMessage = msg`Edit group`;
const headerBackMessage = msg`Close`;

export const EditGroupRouteOptions: ExtendedStackNavigationOptions = {
	headerTitle: i18n._(headerTitleMessage),
	presentation: "modal",
	headerBackTitle: i18n._(headerBackMessage),
};
