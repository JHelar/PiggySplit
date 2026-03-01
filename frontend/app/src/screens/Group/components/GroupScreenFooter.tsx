import { Trans } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import { type Group, GroupState } from "@/api/group";
import { MemberState, memberReadyToPay } from "@/api/member";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { ScreenContentFooter } from "@/ui/components/ScreenContentFooter";
import { includes } from "@/utils/includes";

type GroupScreenFooterProps = {
	group: Group;
};
export function GroupScreenFooter({ group }: GroupScreenFooterProps) {
	const { mutate: setReadyToPay, isPending } = useMutation(memberReadyToPay());
	const router = useRouter();

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
}

const styles = StyleSheet.create((theme, rt) => ({
	footer: { justifyContent: "space-between" },
}));
