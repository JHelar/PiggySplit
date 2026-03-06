import { i18n } from "@lingui/core";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { Snackbar } from "@/components/SnackbarRoot";
import { fetchJSON, fetchRaw } from "@/query/fetch";
import type { Group } from "@/schemas/group";
import { Member, MemberState } from "@/schemas/member";

export function addMember() {
	return mutationOptions({
		async mutationFn(groupId: string) {
			return await fetchRaw(`groups/${groupId}/member`, {
				method: "POST",
			});
		},
		async onSuccess(data, variables, onMutateResult, context) {
			await context.client.invalidateQueries({
				queryKey: ["groups"],
			});
		},
	});
}

type RemoveMemberArguments = {
	memberId: string;
	groupId: string;
};
const memberRemovedSuccess = "Member removed";
const memberRemovedError = "Failed to remove member";
export function removeMember() {
	return mutationOptions({
		async mutationFn({ memberId, groupId }: RemoveMemberArguments) {
			return fetchRaw(`groups/${groupId}/member`, {
				method: "DELETE",
				query: {
					member_id: memberId,
				},
			});
		},
		async onSuccess(data, variables, onMutateResult, context) {
			await context.client.invalidateQueries({
				queryKey: ["groups", { id: variables.groupId }],
			});

			Snackbar.toast({
				text: i18n._(memberRemovedSuccess),
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(memberRemovedError),
			});
		},
	});
}

const memberReadyToPayError = "Unable to set state to ready to pay";
export function memberReadyToPay() {
	return mutationOptions({
		async mutationFn(groupId: string) {
			return fetchRaw(`groups/${groupId}/member/ready`, {
				method: "PATCH",
			});
		},
		async onSuccess(data, groupId, onMutateResult, context) {
			context.client.setQueryData(
				["groups", { id: groupId }],
				(group: Group) =>
					({
						...group,
						member_state: MemberState.enum.Ready,
					}) satisfies Group,
			);
			await context.client.invalidateQueries({
				queryKey: ["groups", { id: groupId }],
			});
		},
		onError(error, variables, onMutateResult, context) {
			console.error(error);
			Snackbar.toast({
				text: i18n._(memberReadyToPayError),
			});
		},
	});
}

export function getMemberInfo(groupId: string) {
	return queryOptions({
		queryKey: ["member_infos", { id: groupId }],
		async queryFn() {
			return await fetchJSON(`groups/${groupId}/member/me`, {
				method: "GET",
				output: Member,
			});
		},
	});
}
