import { Trans, useLingui } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { use } from "react";
import { View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { deleteExpense, type Expense } from "@/api/expense";
import { GroupState } from "@/api/group";
import { MemberState, memberReadyToPay } from "@/api/member";
import { ContextMenu } from "@/components/ContextMenu";
import { Clouds } from "@/components/SVG/Clouds";
import { Pig } from "@/components/SVG/Pig";
import { useScreenFocusSetTheme } from "@/hooks/useScreenFocusSetTheme";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { Avatar, type AvatarType } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { InfoSquare } from "@/ui/components/InfoSquare";
import { ListItem } from "@/ui/components/ListItem";
import {
	ScreenContentFooter,
	ScreenContentFooterSpacer,
} from "@/ui/components/ScreenContentFooter";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";
import { includes } from "@/utils/includes";
import type { GroupScreenProps } from "./Group.types";

const MemberStateToAvatarType: Record<MemberState, AvatarType> = {
	[MemberState.enum.Adding]: "idle",
	[MemberState.enum.Paying]: "paying",
	[MemberState.enum.Resolved]: "payed",
	[MemberState.enum.Ready]: "ready",
};

type ExpenseListItemProps = {
	expense: Expense;
	groupId: number;
	groupState: GroupState;
};
function ExpenseListItem({
	expense,
	groupId,
	groupState,
}: ExpenseListItemProps) {
	const { t } = useLingui();
	const router = useRouter();
	const { mutateAsync: deleteExpenseMutation } = useMutation(deleteExpense());

	return (
		<ListItem
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

export function GroupScreen({ query }: GroupScreenProps) {
	const group = use(query.promise);
	const router = useRouter();
	const { mutate: setReadyToPay, isPending } = useMutation(memberReadyToPay());
	const { theme } = useUnistyles();
	const { t } = useLingui();

	const dept = group.member_contribution - group.pay_per_member;
	const deptTitle = dept < 0 ? t`Dept` : t`Owed`;

	useScreenFocusSetTheme(group.group_theme);

	useScreenOptionsEffect({
		headerTitle: group.group_name,
		unstable_sheetFooter() {
			return (
				<ScreenContentFooter
					style={styles.footer}
					secondary={
						<Button
							variant="ghost"
							disabled={
								!includes(
									[MemberState.enum.Adding, MemberState.enum.Paying],
									group.member_state,
								)
							}
							onPress={() => {
								if (group.member_state === MemberState.enum.Adding) {
									setReadyToPay(group.id.toString());
								} else {
									router.navigate({
										pathname: "/Groups/[groupId]/Pay",
										params: {
											groupId: group.id,
										},
									});
								}
							}}
							icon={
								includes(
									[MemberState.enum.Adding, MemberState.enum.Paying],
									group.member_state,
								) && <Icon name="checkmark" />
							}
							loading={isPending}
						>
							{group.member_state === MemberState.enum.Adding && (
								<Trans>Ready to pay</Trans>
							)}
							{group.member_state === MemberState.enum.Ready && (
								<Trans>Waiting for others</Trans>
							)}
							{group.member_state === MemberState.enum.Resolved && (
								<Trans>All done</Trans>
							)}
							{group.member_state === MemberState.enum.Paying && (
								<Trans>Pay dept</Trans>
							)}
						</Button>
					}
					primary={
						group.group_state === GroupState.enum.Expenses && (
							<Button
								variant="ghost"
								onPress={() =>
									router.navigate({
										pathname: "/Groups/[groupId]/NewExpense",
										params: {
											groupId: group.id,
										},
									})
								}
								icon={<Icon name="create" />}
							></Button>
						)
					}
				/>
			);
		},
	});

	if (group.expenses.length === 0) {
		return (
			<>
				<Clouds style={styles.clouds} />
				<View style={styles.emptyContainer}>
					<Text variant="title" style={styles.emptyHeadline}>
						<Trans>No expenses yet!</Trans>
					</Text>
					<Button
						variant="filled"
						onPress={() => {
							router.navigate({
								pathname: "/Groups/[groupId]/NewExpense",
								params: {
									groupId: group.id,
								},
							});
						}}
					>
						<Trans>Add new expense</Trans>
					</Button>
				</View>
			</>
		);
	}

	return (
		<>
			<InfoSquare
				style={styles.infoSquare}
				info={
					group.group_state === GroupState.enum.Resolved ? (
						<Pig canvas animation="bobbing" />
					) : (
						<>
							<View style={styles.headingContainer}>
								<View style={styles.headingRow}>
									<View style={styles.headingValueContainer}>
										<Text variant="subtitle" style={styles.headingValue}>
											{formatCurrency(group.total_expenses, {
												currencyCode: group.currency_code,
											})}
										</Text>
										<Text variant="body" style={styles.headingTitle}>
											<Trans>Total</Trans>
										</Text>
									</View>
									<View style={styles.headingValueContainer}>
										<Text variant="subtitle" style={styles.headingValue}>
											{formatCurrency(group.pay_per_member, {
												currencyCode: group.currency_code,
											})}
										</Text>
										<Text variant="body" style={styles.headingTitle}>
											<Trans>Pay per member</Trans>
										</Text>
									</View>
								</View>
								<View style={styles.headingRow}>
									<View style={styles.headingValueContainer}>
										<Text variant="subtitle" style={styles.headingValue}>
											{formatCurrency(group.member_contribution, {
												currencyCode: group.currency_code,
											})}
										</Text>
										<Text variant="body" style={styles.headingTitle}>
											<Trans>Your contribution</Trans>
										</Text>
									</View>
									<View style={styles.headingValueContainer}>
										<Text variant="subtitle" style={styles.headingValue}>
											{formatCurrency(dept, {
												currencyCode: group.currency_code,
											})}
										</Text>
										<Text variant="body" style={styles.headingTitle}>
											{deptTitle}
										</Text>
									</View>
								</View>
							</View>
							<View style={styles.members}>
								{group.members.map((member) => (
									<Avatar
										firstName={member.first_name}
										lastName={member.last_name}
										key={member.member_id}
										type={MemberStateToAvatarType[member.member_state]}
									/>
								))}
							</View>
						</>
					)
				}
			/>
			<FlashList
				data={group.expenses}
				keyExtractor={({ id }) => id.toString()}
				style={styles.container}
				ListHeaderComponentStyle={styles.header}
				renderItem={({ item }) => (
					<ExpenseListItem
						expense={item}
						groupId={group.id}
						groupState={group.group_state}
					/>
				)}
				scrollIndicatorInsets={{
					right: -theme.gap(2),
				}}
				ListFooterComponent={<ScreenContentFooterSpacer />}
				ItemSeparatorComponent={() => <View style={styles.spacer} />}
			/>
		</>
	);
}

const styles = StyleSheet.create((theme, rt) => ({
	infoSquare: {
		marginBottom: theme.gap(4),
	},
	headingContainer: {
		flex: 1,
		justifyContent: "space-evenly",
		rowGap: theme.gap(3),
		width: "100%",
	},
	headingRow: {
		justifyContent: "space-between",
		flexDirection: "row",
	},
	footer: { justifyContent: "space-between" },
	headingValueContainer: {
		flexGrow: 1,
		flexShrink: 0,
		flexBasis: 0,
		rowGap: theme.gap(1),
		justifyContent: "center",
		alignItems: "center",
	},
	headingValue: {
		fontWeight: "500",
		textAlign: "center",
	},
	headingTitle: {
		textAlign: "center",
	},
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
		flex: 1,
	},
	header: {
		paddingBottom: theme.gap(4),
	},
	spacer: {
		height: theme.gap(1),
	},
	itemMiddle: {
		columnGap: theme.gap(1),
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
	members: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-evenly",
	},
}));
