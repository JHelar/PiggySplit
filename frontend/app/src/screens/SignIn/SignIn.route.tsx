import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

const signInTitle = msg`Sign in`;
export const SignInRouteOptions: ExtendedStackNavigationOptions = {
	title: i18n._(signInTitle),
	presentation: "modal",
	unstable_headerRightItems() {
		const router = useRouter();
		const { t } = useLingui();
		return [
			{
				type: "button",
				label: t`Cancel`,
				icon: {
					type: "sfSymbol",
					name: "xmark",
				},
				onPress: router.back,
			},
		];
	},
};
