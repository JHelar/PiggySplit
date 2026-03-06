import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { Snackbar } from "@/components/SnackbarRoot";
import { fetchJSON, fetchRaw } from "@/query/fetch";
import { Transactions } from "@/schemas/transaction";

export function getTransactions(groupId: string) {
	return queryOptions({
		queryKey: ["transactions"],
		async queryFn() {
			return fetchJSON(`groups/${groupId}/transaction`, {
				method: "GET",
				output: Transactions,
			});
		},
	});
}

type PayTransactionArguments = {
	transactionId: string;
	groupId: string;
};

const payTransactionFailedTitle = msg`Failed to pay transaction, try again later`;

export function payTransaction() {
	return mutationOptions({
		async mutationFn({ transactionId, groupId }: PayTransactionArguments) {
			return await fetchRaw(
				`groups/${groupId}/transaction/${transactionId}/pay`,
				{
					method: "PATCH",
				},
			);
		},
		async onSuccess(data, variables, onMutateResult, context) {
			await context.client.invalidateQueries({
				queryKey: ["transactions"],
			});
			await context.client.invalidateQueries({
				queryKey: ["groups", { id: variables.groupId }],
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(payTransactionFailedTitle),
			});
		},
	});
}
