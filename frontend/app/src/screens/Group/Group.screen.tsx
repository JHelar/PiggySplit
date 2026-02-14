import { Trans, useLingui } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { use, useMemo } from "react";
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
import { IconButton } from "@/ui/components/IconButton";
import { InfoSquare } from "@/ui/components/InfoSquare";
import { ListItem } from "@/ui/components/ListItem";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";
import { ScreenContentFooterSpacer } from "@/ui/components/ScreenContentFooter/ScreenContentFooter";
import { Text } from "@/ui/components/Text";
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
					<Text variant="body">{expense.cost}kr</Text>
					{includes(
						[GroupState.enum.Paying, GroupState.enum.Generating],
						groupState,
					) && <Icon name="lock-outline" />}
					{groupState === GroupState.enum.Resolved && <Icon name="check" />}
					{groupState === GroupState.enum.Expenses && (
						<ContextMenu
							trigger={
								<IconButton
									name="more-vert"
									accessibilityLabel={t`Open expense menu`}
								/>
							}
							actions={[
								{
									icon: "edit",
									title: t`Edit expense`,
									onPress() {
										router.navigate({
											pathname: "/(modals)/Groups/[groupId]/[expenseId]/Edit",
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

	useScreenFocusSetTheme(group.group_theme);

	const PrimaryFooterButton = useMemo(() => {
		if (group.group_state === GroupState.enum.Expenses) {
			return (
				<Button
					onPress={() =>
						router.navigate({
							pathname: "/(modals)/Groups/[groupId]/NewExpense",
							params: {
								groupId: group.id,
							},
						})
					}
					icon={<Icon name="add-circle-outline" />}
				>
					<Trans>New Expense</Trans>
				</Button>
			);
		}
		if (group.member_state === MemberState.enum.Paying) {
			return (
				<Button
					onPress={() =>
						router.navigate({
							pathname: "/(screens)/Groups/[groupId]/Pay",
							params: {
								groupId: group.id,
							},
						})
					}
					icon={<Icon name="add-circle-outline" />}
				>
					<Trans>Pay</Trans>
				</Button>
			);
		}
	}, [group.group_state, group.id, group.member_state, router.navigate]);

	const SecondaryFooterButton = useMemo(() => {
		if (group.member_state === MemberState.enum.Adding) {
			return (
				<Button
					icon={<Icon name="check" />}
					onPress={() => setReadyToPay(group.id.toString())}
					loading={isPending}
				>
					<Trans>Ready to pay</Trans>
				</Button>
			);
		}
	}, [group.id.toString, group.member_state, isPending, setReadyToPay]);

	useScreenOptionsEffect({
		unstable_sheetFooter() {
			if (PrimaryFooterButton || SecondaryFooterButton) {
				return (
					<ScreenContentFooter
						primary={PrimaryFooterButton}
						secondary={SecondaryFooterButton}
					/>
				);
			}
			return null;
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
								pathname: "/(modals)/Groups/[groupId]/NewExpense",
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
				title={<Text variant="headline">{group.group_name}</Text>}
				info={
					group.group_state === GroupState.enum.Resolved ? (
						<Pig canvas animation="bobbing" />
					) : (
						<>
							<View style={styles.headingContainer}>
								<View style={styles.headingRow}>
									<Text variant="subtitle" style={styles.headingValue}>
										{group.total_expenses} / {group.member_contribution}
									</Text>
									<Text variant="body">
										<Trans>Total / You</Trans>
									</Text>
								</View>
								<View style={styles.headingRow}>
									<Text variant="subtitle" style={styles.headingValue}>
										{group.pay_per_member} /{" "}
										{group.member_contribution - group.pay_per_member}
									</Text>
									<Text variant="body">
										<Trans>PPM / Dept</Trans>
									</Text>
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
		width: "100%",
		justifyContent: "space-between",
		flexDirection: "row",
		columnGap: theme.gap(2),
	},
	headingRow: {
		rowGap: theme.gap(1),
		justifyContent: "center",
		alignItems: "center",
	},
	headingValue: {
		fontWeight: "500",
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
