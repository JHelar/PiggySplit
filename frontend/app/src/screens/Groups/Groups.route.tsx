import { useLingui } from "@lingui/react/macro";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { getUser, signOut } from "@/api/user";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";

export const GroupsRouteOptions: ExtendedStackNavigationOptions = {
	unstable_headerRightItems() {
		const { t } = useLingui();
		const { data: user } = useQuery(getUser());
		const { mutate: signOutMutation } = useMutation(signOut());

		return [
			{
				type: "menu",
				label: t`Profile`,
				icon: {
					type: "sfSymbol",
					name: "ellipsis",
				},
				menu: {
					label: t`Profile`,
					items: [
						{
							type: "action",
							label: `${user?.first_name} ${user?.last_name}`,
							icon: {
								name: "person",
								type: "sfSymbol",
							},
							onPress() {
								router.navigate("/Profile");
							},
						},
						{
							type: "action",
							label: "Sign out",
							icon: {
								name: "rectangle.portrait.and.arrow.forward",
								type: "sfSymbol",
							},
							onPress: signOutMutation,
						},
					],
				},
			},
		];
	},
	unstable_sheetFooter() {
		const router = useRouter();
		const { t } = useLingui();

		return (
			<ScreenContentFooter
				primary={
					<Button
						variant="ghost"
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
