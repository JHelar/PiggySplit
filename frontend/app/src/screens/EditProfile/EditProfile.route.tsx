import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

const headerTitleMessage = msg`Edit user`;

export const EditProfileRouteOptions: ExtendedStackNavigationOptions = {
	presentation: "modal",
	headerTitle: i18n._(headerTitleMessage),
};
