import { zodResolver } from "@hookform/resolvers/zod";
import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { use } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UpsertExpense, updateExpense } from "@/api/expense";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { FormField } from "@/ui/components/FormField";
import { TextInput } from "@/ui/components/TextInput";
import type { EditExpenseRouteParams } from "./EditExpense.route";
import type { EditExpenseScreenProps } from "./EditExpense.types";

export function EditExpenseScreen({ query }: EditExpenseScreenProps) {
	const group = use(query.promise);
	const { groupId, expenseId } = useLocalSearchParams<EditExpenseRouteParams>();
	const expense = group.expenses.find(
		(expense) => expense.id.toString() === expenseId,
	);

	const { t } = useLingui();
	const router = useRouter();
	const { mutateAsync } = useMutation(updateExpense());
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
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		rowGap: theme.gap(2),
	},
}));
