import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { UserContextMenu } from "@/components/ContextMenu";
import { Button as UIButton } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";

export const GroupsRouteOptions: ExtendedStackNavigationOptions = {
	headerRight: UserContextMenu,

	unstable_sheetFooter() {
		const router = useRouter();
		return (
			<ScreenContentFooter
				primary={
					<UIButton
						onPress={() => router.navigate("/Groups/New")}
						icon={<Icon name="add-circle-outline" />}
					>
						<Trans>New group</Trans>
					</UIButton>
				}
			/>
		);
	},
};
