import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import z from "zod";
import { Snackbar } from "@/components/SnackbarRoot";
import { queryClient } from "@/query";
import { fetchJSON, fetchRaw } from "@/query/fetch";
import { Expense } from "./expense";
import { Member, MemberRole, MemberState } from "./member";

export const ColorTheme = z.enum({
	Blue: "color_theme:blue",
	Green: "color_theme:green",
});
export type ColorTheme = z.infer<typeof ColorTheme>;

export const GroupState = z.enum({
	Expenses: "group_state:expenses",
	Generating: "group_state:generating",
	Paying: "group_state:paying",
	Resolved: "group_state:resolved",
	Archived: "group_state:archived",
});
export type GroupState = z.infer<typeof GroupState>;

const GroupBase = z.object({
	id: z.number(),
	group_name: z.string(),
	group_state: GroupState,
	group_theme: ColorTheme,
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
	total_expenses: z.number(),
	pay_per_member: z.number(),
	expenses: z.array(Expense),
	members: z.array(Member),
});
type GroupBase = z.output<typeof GroupBase>;

export const GroupWithMembers = GroupBase.omit({ expenses: true });
export type GroupWithMembers = z.output<typeof GroupWithMembers>;

export const Group = GroupBase.and(
	z.object({
		member_role: MemberRole,
		member_state: MemberState,
		member_contribution: z.number(),
	}),
);
export type Group = z.output<typeof Group>;

export const Groups = z.array(GroupWithMembers);
export type Groups = z.output<typeof Groups>;

export function getGroups() {
	return queryOptions({
		queryKey: ["groups"],
		async queryFn() {
			return await fetchJSON("groups", {
				method: "GET",
				output: Groups,
			});
		},
	});
}

export function getGroup(groupId: number | string) {
	return queryOptions({
		queryKey: ["groups", { id: groupId.toString() }],
		async queryFn() {
			return await fetchJSON(`groups/${groupId}`, {
				method: "GET",
				output: Group,
			});
		},
	});
}

export const UpsertGroup = z.object({
	display_name: z.string(),
	color_theme: ColorTheme,
});
export type UpsertGroup = z.output<typeof UpsertGroup>;

const createGroupSuccessTitle = msg`Group crated`;
const createGroupFailedTitle = msg`Failed to crate group, something went wrong`;

export function createGroup() {
	return mutationOptions({
		async mutationFn(group: UpsertGroup) {
			return await fetchJSON("groups", {
				method: "POST",
				output: z.object({
					group_id: z.number(),
					color_theme: ColorTheme,
				}),
				body: JSON.stringify(group),
			});
		},
		onSuccess() {
			Snackbar.toast({
				text: i18n._(createGroupSuccessTitle),
			});
		},
		async onSettled(data, error, variables, onMutateResult, context) {
			await queryClient.invalidateQueries({
				queryKey: ["groups"],
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(createGroupFailedTitle),
			});
		},
	});
}

type UpdateGroup = {
	groupId: number;
	payload: UpsertGroup;
};
const updateGroupSuccessTitle = msg`Group updated`;
const updateGroupFailedTitle = msg`Failed to update group`;
export function updateGroup() {
	return mutationOptions({
		async mutationFn({ groupId, payload }: UpdateGroup) {
			return await fetchJSON(`groups/${groupId}`, {
				method: "PATCH",
				body: JSON.stringify(payload),
				output: GroupBase.pick({ id: true }),
			});
		},
		async onSuccess(data, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(updateGroupSuccessTitle),
			});
			queryClient.invalidateQueries({
				queryKey: ["groups"],
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(updateGroupFailedTitle),
			});
		},
	});
}

const deleteGroupSuccessTitle = msg`Group deleted`;
const deleteGroupFailedTitle = msg`Failed to delete group, try again later`;
export function deleteGroup() {
	return mutationOptions({
		async mutationFn(groupId: number) {
			return await fetchRaw(`groups/${groupId}`, {
				method: "DELETE",
			});
		},
		async onSuccess(data, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(deleteGroupSuccessTitle),
			});
			queryClient.removeQueries({
				queryKey: ["groups", { id: variables }],
			});
			queryClient.invalidateQueries({
				queryKey: ["groups"],
				exact: true,
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(deleteGroupFailedTitle),
			});
		},
	});
}
