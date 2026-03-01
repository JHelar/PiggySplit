import { Trans, useLingui } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { use } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { GroupState } from "@/api/group";
import { MemberState } from "@/api/member";
import { ListContainer } from "@/components/ListContainer";
import { Clouds } from "@/components/SVG/Clouds";
import { Pig } from "@/components/SVG/Pig";
import { useScreenFocusSetTheme } from "@/hooks/useScreenFocusSetTheme";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { Avatar, type AvatarType } from "@/ui/components/Avatar";
import { Button } from "@/ui/components/Button";
import { InfoSquare } from "@/ui/components/InfoSquare";
import { Text } from "@/ui/components/Text";
import { ExpenseListItem } from "./components/ExpenseListItem";
import { GroupScreenFooter } from "./components/GroupScreenFooter";
import type { GroupScreenProps } from "./Group.types";

const MemberStateToAvatarType: Record<MemberState, AvatarType> = {
	[MemberState.enum.Adding]: "idle",
	[MemberState.enum.Paying]: "paying",
	[MemberState.enum.Resolved]: "payed",
	[MemberState.enum.Ready]: "ready",
};

export function GroupScreen({ query }: GroupScreenProps) {
	const group = use(query.promise);
	const router = useRouter();
	const { t } = useLingui();

	const dept = group.member_contribution - group.pay_per_member;
	const deptTitle = dept < 0 ? t`Dept` : t`Owed`;

	useScreenFocusSetTheme(group.group_theme);

	useScreenOptionsEffect({
		headerTitle: group.group_name,
		unstable_sheetFooter() {
			return <GroupScreenFooter group={group} />;
		},
	});

	if (group.expenses.length === 0) {
		return (
			<>
				<Clouds />
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
			<Clouds />
			<InfoSquare
				style={styles.infoSquare}
				info={
					group.group_state === GroupState.enum.Resolved ? (
						<Pig canvas animation="bobbing" />
					) : (
						<>
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
			<ListContainer
				data={group.expenses}
				keyExtractor={({ id }) => id.toString()}
				renderItem={({ item }) => (
					<ExpenseListItem
						expense={item}
						groupId={group.id}
						groupState={group.group_state}
					/>
				)}
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
	emptyContainer: {
		justifyContent: "center",
		rowGap: theme.gap(4),
		flex: 1,
	},
	emptyHeadline: {
		textAlign: "center",
	},
	members: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		columnGap: theme.gap(0.5),
	},
}));
