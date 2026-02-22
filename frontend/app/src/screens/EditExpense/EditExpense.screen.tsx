import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { use, useCallback } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { deleteExpense, UpsertExpense, updateExpense } from "@/api/expense";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { Button } from "@/ui/components/Button";
import { FormField } from "@/ui/components/FormField";
import { Icon } from "@/ui/components/Icon";
import { TextInput } from "@/ui/components/TextInput";
import type { EditExpenseRouteParams } from "./EditExpense.route";
import type { EditExpenseScreenProps } from "./EditExpense.types";

export function EditExpenseScreen({ query }: EditExpenseScreenProps) {
	const group = use(query.promise);
	const { groupId, expenseId } = useLocalSearchParams<EditExpenseRouteParams>();
	const expense = group.expenses.find(
		(expense) => expense.id.toString() === expenseId,
	);
	const { mutateAsync: deleteExpenseMutation, isPending: isDeleting } =
		useMutation(deleteExpense());

	const { t } = useLingui();
	const router = useRouter();
	const { mutateAsync, isPending } = useMutation(updateExpense());
	const form = useForm({
		resolver: zodResolver(UpsertExpense),
		defaultValues: {
			expense_cost: expense?.cost.toString(),
			expense_name: expense?.name,
		},
	});

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			await mutateAsync({
				expenseId,
				groupId,
				payload: data,
			});
		} finally {
			router.back();
		}
	});

	const onDelete = useCallback(async () => {
		await deleteExpenseMutation({
			groupId: group.id,
			expenseId: expenseId,
		});
		router.back();
	}, [deleteExpenseMutation, expenseId, group.id, router.back]);

	useScreenOptionsEffect({
		unstable_headerLeftItems() {
			return [
				{
					type: "button",
					label: t`Cancel`,
					onPress: router.back,
					icon: {
						type: "sfSymbol",
						name: "xmark",
					},
				},
			];
		},
		unstable_headerRightItems() {
			return [
				{
					type: "button",
					variant: "done",
					label: t`Save`,
					icon: {
						type: "sfSymbol",
						name: "checkmark",
					},
					onPress() {
						onSubmit();
					},
				},
			];
		},
	});

	return (
		<View style={styles.container}>
			<FormField
				control={form.control}
				label={t`Expense name`}
				name="expense_name"
				input={<TextInput autoCapitalize="words" keyboardType="default" />}
			/>
			<FormField
				control={form.control}
				label={t`Cost`}
				name="expense_cost"
				input={
					<TextInput
						autoCorrect={false}
						keyboardType="numbers-and-punctuation"
					/>
				}
			/>
			<Button
				onPress={onDelete}
				variant="destructive"
				icon={<Icon name="delete-outline" />}
				loading={isDeleting}
			>
				<Trans>Delete expense</Trans>
			</Button>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		rowGap: theme.gap(2),
	},
}));
