import { zodResolver } from "@hookform/resolvers/zod";
import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { createExpense, UpsertExpense } from "@/api/expense";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { FormField } from "@/ui/components/FormField";
import { TextInput } from "@/ui/components/TextInput";
import type { NewExpenseRouteParams } from "./NewExpense.route";

export function NewExpenseScreen() {
	const { t } = useLingui();
	const router = useRouter();
	const { groupId } = useLocalSearchParams<NewExpenseRouteParams>();
	const { mutateAsync, isPending } = useMutation(createExpense());
	const form = useForm({
		resolver: zodResolver(UpsertExpense),
	});

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			await mutateAsync({
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
					icon: {
						type: "sfSymbol",
						name: "xmark",
					},
					onPress: router.back,
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
					onPress: onSubmit,
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
				input={<TextInput keyboardType="numbers-and-punctuation" />}
			/>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		rowGap: theme.gap(2),
	},
}));
