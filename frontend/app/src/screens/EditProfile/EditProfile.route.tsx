import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Button } from "@/ui/components/Button";

const headerTitleMessage = msg`Edit user`;

export const EditProfileRouteOptions: ExtendedStackNavigationOptions = {
	presentation: "modal",
	headerTitle: i18n._(headerTitleMessage),
	headerLeft() {
		const router = useRouter();
		return (
			<Button variant="ghost" onPress={() => router.back()}>
				<Trans>Close</Trans>
			</Button>
		);
	},
	headerRight() {
		return (
			<Button variant="ghost">
				<Trans>Save</Trans>
			</Button>
		);
	},
};
