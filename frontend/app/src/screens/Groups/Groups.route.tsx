import { useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";

export const GroupsRouteOptions: ExtendedStackNavigationOptions = {
	unstable_sheetFooter() {
		const router = useRouter();
		const { t } = useLingui();

		return (
			<ScreenContentFooter
				primary={
					<Button
						accessibilityLabel={t`New group`}
						onPress={() => {
							router.navigate("/Groups/New");
						}}
						icon={<Icon name="create" />}
					></Button>
				}
			/>
		);
	},
};
