import { Trans } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { use } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { GroupWithMembers } from "@/api/group";
import { MembersRow } from "@/components/MembersRow";
import { Clouds } from "@/components/SVG/Clouds";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ListItem } from "@/ui/components/ListItem";
import { ScreenContentFooterSpacer } from "@/ui/components/ScreenContentFooter/ScreenContentFooter";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";
import type { GroupsScreenProps } from "./Groups.types";

type GroupListItemProps = {
	group: GroupWithMembers;
	onPress(): void;
};
function GroupListItem({ group, onPress }: GroupListItemProps) {
	return (
		<ListItem
			onPress={onPress}
			middle={
				<View style={styles.itemMiddle}>
					<Text variant="small">{group.group_name}</Text>
					<MembersRow members={group.members} />
				</View>
			}
			right={
				<View>
					<Text variant="body">
						{formatCurrency(group.total_expenses, {
							currencyCode: group.currency_code,
						})}
					</Text>
					<Icon name="chevron-right" />
				</View>
			}
		/>
	);
}

export function GroupsScreen({ query }: GroupsScreenProps) {
	const groups = use(query.promise);
	const router = useRouter();
	const { theme } = useUnistyles();

	if (groups.length === 0) {
		return (
			<>
				<Clouds style={styles.clouds} />
				<View style={styles.emptyContainer}>
					<Text variant="title" style={styles.emptyHeadline}>
						<Trans>Nothing to see here!</Trans>
					</Text>
					<Button
						variant="filled"
						onPress={() => router.navigate("/(modals)/Groups/New")}
					>
						<Trans>Create new group</Trans>
					</Button>
				</View>
			</>
		);
	}

	return (
		<FlashList
			data={groups}
			keyExtractor={({ id }) => id.toString()}
			style={styles.container}
			ListHeaderComponentStyle={styles.header}
			ListFooterComponent={<ScreenContentFooterSpacer />}
			renderItem={({ item }) => (
				<GroupListItem
					group={item}
					onPress={() => {
						router.navigate({
							pathname: "/(screens)/Groups/[groupId]",
							params: {
								groupId: item.id,
							},
						});
					}}
				/>
			)}
			scrollIndicatorInsets={{
				right: -theme.gap(2),
			}}
			ItemSeparatorComponent={() => <View style={styles.spacer} />}
		/>
	);
}

const styles = StyleSheet.create((theme, rt) => ({
	clouds: {
		position: "absolute",
		top: 0,
		height: rt.screen.height,
		width: rt.screen.width,
	},
	emptyContainer: {
		justifyContent: "center",
		rowGap: theme.gap(4),
		flex: 1,
	},
	emptyHeadline: {
		textAlign: "center",
	},
	container: {
		paddingTop: theme.gap(1),
	},
	header: {
		paddingBottom: theme.gap(4),
	},
	spacer: {
		height: theme.gap(1),
	},
	itemMiddle: {
		rowGap: theme.gap(1),
	},
}));
