import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { RouteParams } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export type EditExpenseRouteParams =
	RouteParams<"/Groups/[groupId]/[expenseId]/Edit">;

const headerTitleMessage = msg`Edit expense`;

export const EditExpenseRouteOptions: ExtendedStackNavigationOptions = {
	headerTitle: i18n._(headerTitleMessage),
	presentation: "modal",
};
