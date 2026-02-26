import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { mutationOptions } from "@tanstack/react-query";
import z from "zod";
import { Alert } from "@/components/AlertRoot";
import { Snackbar } from "@/components/SnackbarRoot";
import { fetchJSON, fetchRaw } from "@/query/fetch";
import type { Group } from "./group";

export const UpsertExpense = z.object({
	expense_name: z.string(),
	expense_cost: z.coerce.number(),
});

export type UpsertExpense = z.infer<typeof UpsertExpense>;

export const Expense = z.object({
	id: z.number(),
	name: z.string(),
	cost: z.number(),
	currency_code: z.string(),
	first_name: z.string(),
	last_name: z.string(),
});

export type Expense = z.infer<typeof Expense>;

type CreateExpenseArguments = {
	groupId: string;
	payload: UpsertExpense;
};

const createExpenseSuccessTitle = msg`Expense created`;
const createExpenseFailedTitle = msg`Failed to crate expense, something went wrong`;
export function createExpense() {
	return mutationOptions({
		async mutationFn({ groupId, payload }: CreateExpenseArguments) {
			return await fetchJSON(`groups/${groupId}/expense`, {
				method: "POST",
				output: Expense,
				body: JSON.stringify(payload),
			});
		},
		onSuccess(data, variables, onMutateResult, context) {
			context.client.invalidateQueries({
				queryKey: ["groups"],
			});
			Snackbar.toast({
				text: i18n._(createExpenseSuccessTitle),
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(createExpenseFailedTitle),
			});
		},
	});
}

const updateExpenseSuccessTitle = msg`Expense updated`;
const updateExpenseFailedTitle = msg`Failed to update expense, something went wrong`;
type UpdateExpenseArguments = {
	groupId: string;
	expenseId: string;
	payload: UpsertExpense;
};
export function updateExpense() {
	return mutationOptions({
		async mutationFn({ groupId, expenseId, payload }: UpdateExpenseArguments) {
			return await fetchJSON(`groups/${groupId}/expense/${expenseId}`, {
				method: "PATCH",
				body: JSON.stringify(payload),
			});
		},
		onSuccess(data, variables, onMutateResult, context) {
			context.client.invalidateQueries({
				queryKey: ["groups"],
			});
			Snackbar.toast({
				text: i18n._(updateExpenseSuccessTitle),
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(updateExpenseFailedTitle),
			});
		},
	});
}

const deleteExpenseSuccessTitle = msg`Expense deleted`;
const deleteExpenseFailedTitle = msg`Failed to delete expense, something went wrong`;
const deleteExpenseDisclaimerTitle = msg`Delete expense?`;
const deleteExpenseDisclaimerBody = msg`Are you sure you want to delete the expense {name}`;
const deleteExpenseDisclaimerCancel = msg`Cancel`;
const deleteExpenseDisclaimerDelete = msg`Delete`;

type DeleteExpenseArguments = {
	groupId: number;
	expenseId: number | string;
};
export function deleteExpense() {
	return mutationOptions({
		async mutationFn({ groupId, expenseId }: DeleteExpenseArguments, context) {
			const group = context.client.getQueryData<Group>([
				"groups",
				{ id: groupId.toString() },
			]);

			const expense = group?.expenses.find(
				(expense) => expense.id === expenseId,
			);
			deleteExpenseDisclaimerBody.values = {
				name: expense?.name,
			};
			const result = await Alert.destructive({
				cancelText: i18n._(deleteExpenseDisclaimerCancel),
				primaryText: i18n._(deleteExpenseDisclaimerDelete),
				title: i18n._(deleteExpenseDisclaimerTitle),
				body: i18n._(deleteExpenseDisclaimerBody),
			});
			if (result !== "success") {
				return {
					result,
				};
			}

			await fetchRaw(`groups/${groupId}/expense/${expenseId}`, {
				method: "DELETE",
			});
			return {
				result,
			};
		},
		onSuccess(data, variables, onMutateResult, context) {
			if (data.result === "success") {
				context.client.invalidateQueries({
					queryKey: ["groups"],
				});
				Snackbar.toast({
					text: i18n._(deleteExpenseSuccessTitle),
				});
			}
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(deleteExpenseFailedTitle),
			});
		},
	});
}
