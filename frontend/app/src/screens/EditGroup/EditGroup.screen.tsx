import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { FlashList } from "@shopify/flash-list";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { use, useCallback } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { deleteGroup, UpsertGroup, updateGroup } from "@/api/group";
import { type Member, MemberRole, removeMember } from "@/api/member";
import { Alert } from "@/components/AlertRoot";
import { ColorThemePicker } from "@/components/ColorThemePicker";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { Button } from "@/ui/components/Button";
import { FormField } from "@/ui/components/FormField";
import { Icon } from "@/ui/components/Icon";
import { IconButton } from "@/ui/components/IconButton";
import { ListItem } from "@/ui/components/ListItem";
import { Text } from "@/ui/components/Text";
import { TextInput } from "@/ui/components/TextInput";
import type { EditGroupScreenProps } from "./EditGroup.types";

export function EditGroupScreen({ query }: EditGroupScreenProps) {
	const group = use(query.promise);
	const { mutateAsync: updateGroupMutation, isPending: isUpdating } =
		useMutation(updateGroup());
	const { mutateAsync: deleteGroupMutation, isPending: isDeleting } =
		useMutation(deleteGroup());

	const { mutateAsync: removeMemberMutation, isPending: isRemoving } =
		useMutation(removeMember());
	const { t } = useLingui();
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(UpsertGroup),
		defaultValues: {
			color_theme: group.group_theme,
			display_name: group.group_name,
		},
	});

	const onSubmit = form.handleSubmit(async (updateData) => {
		try {
			await updateGroupMutation({
				groupId: group.id,
				payload: updateData,
			});
		} finally {
			router.back();
		}
	});

	useScreenOptionsEffect({
		unstable_headerLeftItems() {
			return [
				{
					type: "button",
					label: t`Cancel`,
					onPress: router.back,
				},
			];
		},
		unstable_headerRightItems() {
			return [
				{
					type: "button",
					label: t`Save`,
					variant: "done",
					onPress: onSubmit,
				},
			];
		},
	});

	const onDelete = useCallback(async () => {
		const result = await Alert.destructive({
			title: t`Delete group?`,
			body: t`Are you sure you want to delete ${group.group_name}`,
			cancelText: t`Cancel`,
			primaryText: t`Delete`,
		});
		if (result === "success") {
			try {
				await deleteGroupMutation(group.id);
			} finally {
				router.dismissTo("/Groups");
			}
		}
	}, [group.group_name, t, deleteGroupMutation, group.id, router.dismissTo]);

	const onRemove = useCallback(
		async (member: Member) => {
			const result = await Alert.destructive({
				title: t`Remove member?`,
				body: t`Are you sure you want to remove ${member.first_name} ${member.last_name} from the group`,
				cancelText: t`Cancel`,
				primaryText: t`Remove`,
			});
			if (result === "success") {
				try {
					await removeMemberMutation({
						groupId: group.id.toString(),
						memberId: member.member_id.toString(),
					});
				} catch (error) {
					console.error(error);
				}
			}
		},
		[group.id, t, removeMemberMutation],
	);

	return (
		<FlashList
			data={group.members.filter(
				({ member_role }) => member_role === MemberRole.enum.Regular,
			)}
			renderItem={({ item }) => (
				<ListItem
					middle={
						<Text variant="small">
							{item.first_name} {item.last_name}
						</Text>
					}
					right={
						<IconButton
							onPress={() => onRemove(item)}
							accessibilityLabel={t`Remove ${item.first_name} ${item.last_name} from the group`}
							name="delete-outline"
						/>
					}
				/>
			)}
			ItemSeparatorComponent={() => <View style={styles.spacer} />}
			ListHeaderComponent={
				<>
					<View style={styles.content}>
						<FormField
							control={form.control}
							label={t`Group name`}
							name="display_name"
							input={
								<TextInput autoCapitalize="words" keyboardType="default" />
							}
						/>
						<FormField
							control={form.control}
							label={t`Color theme`}
							name="color_theme"
							input={<ColorThemePicker />}
						/>
					</View>
					<Text variant="title" style={styles.memberTitle}>
						Group Members
					</Text>
				</>
			}
			ListFooterComponent={
				<Button
					variant="destructive"
					onPress={onDelete}
					icon={<Icon name="delete-outline" />}
					loading={isDeleting}
				>
					<Trans>Delete group</Trans>
				</Button>
			}
		/>
	);
}

const styles = StyleSheet.create((theme) => ({
	spacer: {
		height: theme.gap(1),
	},
	memberTitle: {
		marginTop: theme.gap(5),
		marginBottom: theme.gap(2),
	},
	container: {
		backgroundColor: "red",
	},
	content: {
		rowGap: theme.gap(2),
	},
}));
