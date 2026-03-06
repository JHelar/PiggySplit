import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import z from "zod";
import { unauthorize } from "@/auth/auth.store";
import { Snackbar } from "@/components/SnackbarRoot";
import { queryClient } from "@/query";
import { fetchJSON, fetchRaw } from "@/query/fetch";
import { User } from "@/schemas/user";

export function signIn() {
	return mutationOptions({
		async mutationFn(mutationArgs: { email: string }) {
			await fetchJSON("user/signIn", {
				body: JSON.stringify(mutationArgs),
				method: "POST",
			});
		},
	});
}

export function signOut() {
	return mutationOptions({
		async mutationFn() {
			return await fetchRaw("user/signOut", {
				method: "GET",
			});
		},
		onSettled(data, error, variables, onMutateResult, context) {
			context.client.clear();
			unauthorize();
		},
	});
}

type VerifyUserArguments = { email: string; code: number };
export function verifyCode() {
	return mutationOptions({
		async mutationFn({ email, code }: VerifyUserArguments) {
			return await fetchJSON("user/signIn", {
				method: "GET",
				output: z.object({
					session: z.string(),
					new_user: z.boolean(),
				}),
				query: {
					email,
					code: code.toString(),
				},
			});
		},
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ["user"] });
		},
	});
}

export function getUser() {
	return queryOptions({
		queryKey: ["user"],
		async queryFn() {
			return await fetchJSON("user/me", {
				method: "GET",
				output: User,
			});
		},
	});
}

type CreateUserArguments = {
	first_name: string;
	last_name: string;
	phone_number: string;
	sessionId: string;
};
export function createUser() {
	return mutationOptions({
		mutationKey: ["user"],
		async mutationFn(createUserArgs: CreateUserArguments) {
			return await fetchJSON("user/create", {
				method: "POST",
				output: User,
				headers: {
					Authorization: `Bearer ${createUserArgs.sessionId}`,
				},
				body: JSON.stringify(createUserArgs),
			});
		},
	});
}
const userDeletedToastText = msg`User deleted`;
export function deleteUser() {
	return mutationOptions({
		async mutationFn() {
			return await fetchRaw("user/me", {
				method: "DELETE",
			});
		},
		onSuccess() {
			queryClient.clear();
			unauthorize();

			Snackbar.toast({
				text: i18n._(userDeletedToastText),
			});
		},
	});
}

type UpdateUserArguments = {
	first_name: string;
	last_name: string;
	phone_number: string;
	email: string;
};
const updateUserSuccessTitle = msg`User updated`;
const updateUserFailedTitle = msg`Update failed, something went wrong`;
export function updateUser() {
	return mutationOptions({
		mutationKey: ["user"],
		async mutationFn(updateUserArguments: UpdateUserArguments) {
			return await fetchJSON("user/me", {
				method: "PATCH",
				output: User,
				body: JSON.stringify(updateUserArguments),
			});
		},
		onSuccess() {
			Snackbar.toast({
				text: i18n._(updateUserSuccessTitle),
			});
			queryClient.invalidateQueries({
				queryKey: ["user"],
			});
		},
		onError(error, variables, onMutateResult, context) {
			Snackbar.toast({
				text: i18n._(updateUserFailedTitle),
			});
		},
	});
}
