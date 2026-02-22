import { useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

export const GroupsRouteOptions: ExtendedStackNavigationOptions = {
	unstable_headerRightItems() {
		const router = useRouter();
		const { t } = useLingui();
		return [
			{
				type: "button",
				variant: "prominent",
				label: t`New group`,
				icon: {
					type: "sfSymbol",
					name: "plus",
				},
				onPress() {
					router.navigate("/Groups/New");
				},
			},
		];
	},
};
