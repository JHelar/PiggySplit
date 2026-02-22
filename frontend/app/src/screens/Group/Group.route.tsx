import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { createURL } from "expo-linking";
import { type RouteParams, router } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Share } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { getMemberInfo, MemberRole } from "@/api/member";
import { useLazyLocalSearchParams } from "@/hooks/useLazyLocalSearchParams";

export type GroupRouteParams = RouteParams<"/Groups/[groupId]">;

export const GroupRouteOptions: ExtendedStackNavigationOptions = {
	headerBackTitle: "Groups",
	headerBackVisible: true,
	unstable_headerRightItems() {
		const { t } = useLingui();
		const params = useLazyLocalSearchParams<GroupRouteParams>();
		const { data: memberInfo } = useQuery(
			getMemberInfo(params.groupId.toString()),
		);

		const items: ReturnType<
			NonNullable<ExtendedStackNavigationOptions["unstable_headerRightItems"]>
		> = [];
		items.push({
			type: "button",
			icon: {
				type: "sfSymbol",
				name: "square.and.arrow.up",
			},
			label: t`Share group`,
			onPress: () =>
				Share.share({
					url: createURL(`groups/${params.groupId}/invite`),
					title: t`Invite members`,
				}),
		});
		if (memberInfo?.member_role === MemberRole.enum.Admin) {
			items.push({
				type: "button",
				label: t`Edit group`,
				icon: {
					type: "sfSymbol",
					name: "pencil",
				},
				onPress() {
					router.navigate({
						pathname: "/Groups/[groupId]/Edit",
						params: {
							groupId: params.groupId,
						},
					});
				},
			});
		}
		items.push({
			type: "spacing",
			spacing: 8,
		});
		items.push({
			type: "button",
			label: t`Add expense`,
			variant: "prominent",
			sharesBackground: false,
			icon: {
				type: "sfSymbol",
				name: "plus",
			},
			onPress() {
				router.navigate({
					pathname: "/(tabs)/Groups/[groupId]/NewExpense",
					params: {
						groupId: params.groupId,
					},
				});
			},
		});
		return items;
	},
};

const styles = StyleSheet.create((theme) => ({
	buttonContainer: {
		flexDirection: "row",
		columnGap: theme.gap(2),
		alignItems: "center",
	},
}));
