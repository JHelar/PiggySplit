import { useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";

export const GroupsRouteOptions: ExtendedStackNavigationOptions = {
	unstable_sheetFooter() {
		return (
			<ScreenContentFooter
				primary={<Button icon={<Icon name="create" />}></Button>}
			/>
		);
	},
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
					name: "square.and.pencil",
				},
				onPress() {
					router.navigate("/Groups/New");
				},
			},
		];
	},
};
