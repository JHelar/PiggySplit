import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { GroupWithMembers } from "@/api/group";
import { MembersRow } from "@/components/MembersRow";
import { Icon } from "@/ui/components/Icon";
import { ListItem } from "@/ui/components/ListItem";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";

type GroupListItemProps = {
	group: GroupWithMembers;
	onPress(): void;
};
export function GroupListItem({ group, onPress }: GroupListItemProps) {
	return (
		<ListItem
			variant="group"
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

const styles = StyleSheet.create((theme, rt) => ({
	itemMiddle: {
		rowGap: theme.gap(1),
	},
}));
