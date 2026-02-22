import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Button } from "@/ui/components/Button";

const signInTitle = msg`Sign in`;
export const SignInRouteOptions: ExtendedStackNavigationOptions = {
	title: i18n._(signInTitle),
	presentation: "modal",
	headerLeft() {
		const router = useRouter();
		return (
			<Button variant="ghost" header onPress={() => router.back()}>
				<Trans>Cancel</Trans>
			</Button>
		);
	},
};
