import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { deleteExpense, type Expense } from "@/api/expense";
import { GroupState } from "@/api/group";
import { ContextMenu } from "@/components/ContextMenu";
import { Icon } from "@/ui/components/Icon";
import { ListItem } from "@/ui/components/ListItem";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";
import { includes } from "@/utils/includes";

type ExpenseListItemProps = {
	expense: Expense;
	groupId: number;
	groupState: GroupState;
};
export function ExpenseListItem({
	expense,
	groupId,
	groupState,
}: ExpenseListItemProps) {
	const { t } = useLingui();
	const router = useRouter();
	const { mutateAsync: deleteExpenseMutation } = useMutation(deleteExpense());

	return (
		<ListItem
			variant="expense"
			middle={
				<View style={styles.itemMiddle}>
					<Icon
						name="initials"
						firstName={expense.first_name}
						lastName={expense.last_name}
						style={styles.icon}
					/>
					<Text variant="small">{expense.name}</Text>
				</View>
			}
			right={
				<View>
					<Text variant="body">
						{formatCurrency(expense.cost, {
							currencyCode: expense.currency_code,
						})}
					</Text>
					{includes(
						[GroupState.enum.Paying, GroupState.enum.Generating],
						groupState,
					) && <Icon name="lock" />}
					{groupState === GroupState.enum.Resolved && <Icon name="checkmark" />}
					{groupState === GroupState.enum.Expenses && (
						<ContextMenu
							trigger={
								<Icon
									name="list-menu"
									accessibilityLabel={t`Open expense menu`}
								/>
							}
							actions={[
								{
									icon: "edit",
									title: t`Edit expense`,
									onPress() {
										router.navigate({
											pathname: "/Groups/[groupId]/[expenseId]/Edit",
											params: {
												expenseId: expense.id,
												groupId,
											},
										});
									},
								},
								{
									icon: "delete",
									title: t`Delete expense`,
									async onPress() {
										try {
											await deleteExpenseMutation({
												groupId,
												expenseId: expense.id,
											});
										} finally {
										}
									},
								},
							]}
						/>
					)}
				</View>
			}
		/>
	);
}
const styles = StyleSheet.create((theme, rt) => ({
	itemMiddle: {
		columnGap: theme.gap(2),
		flexDirection: "row",
		alignItems: "center",
	},
	icon: {
		...theme.elevation(1),
		shadowOffset: {
			height: 0,
			width: 1,
		},
	},
}));
