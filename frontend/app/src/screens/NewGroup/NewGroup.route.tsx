import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

const headerTitleMessage = msg`New group`;

export const NewGroupRouteOptions: ExtendedStackNavigationOptions = {
	headerTitle: i18n._(headerTitleMessage),
	presentation: "modal",
};
