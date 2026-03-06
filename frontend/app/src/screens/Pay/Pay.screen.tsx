import { Trans } from "@lingui/react/macro";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { use, useCallback, useRef, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { payTransaction } from "@/api/transaction";
import { queryClient } from "@/query";
import { type Transaction, TransactionState } from "@/schemas/transaction";
import { Button } from "@/ui/components/Button";
import { ProgressStepper } from "@/ui/components/ProgressStepper";
import { Text } from "@/ui/components/Text";
import { TextInput } from "@/ui/components/TextInput";
import type { PayScreenProps, TransactionViewProps } from "./Pay.types";

function TransactionView({ transaction, onPay, paying }: TransactionViewProps) {
	return (
		<View style={styles.transactionContainer}>
			<Text variant="headline" style={styles.transactionTitle}>
				{transaction.to_first_name} {transaction.to_last_name}
			</Text>
			<TextInput value={transaction.to_phone_number.toString()} />
			<TextInput value={transaction.transaction_amount.toString()} />
			<Button style={styles.transactionButton} loading={paying} onPress={onPay}>
				<Trans>Mark as paid</Trans>
			</Button>
		</View>
	);
}

export function PayScreen({ query, groupId }: PayScreenProps) {
	const transactions = use(query.promise);
	const { mutateAsync, isPending } = useMutation(payTransaction());
	const [minItemWidth, setMinItemWidth] = useState(0);
	const router = useRouter();
	const flatListRef = useRef<FlashListRef<Transaction>>(null);

	const paidTransactions = transactions.filter(
		({ transaction_state }) => transaction_state === TransactionState.enum.Paid,
	).length;
	const totalTransactions = transactions.length;

	const handleLayoutChange = useCallback((event: LayoutChangeEvent) => {
		setMinItemWidth(event.nativeEvent.layout.width);
	}, []);

	const handlePay = useCallback(
		async (transactionId: string) => {
			try {
				await mutateAsync({
					transactionId,
					groupId,
				});
				if (transactionId === transactions.at(-1)?.transaction_id.toString()) {
					await queryClient.invalidateQueries({
						queryKey: ["groups", { id: groupId }],
					});
					router.back();
				} else {
					flatListRef.current?.scrollToIndex({
						index: paidTransactions,
						animated: true,
					});
				}
			} catch (error) {
				console.error(error);
			}
		},
		[groupId, mutateAsync, router.back, transactions.at, paidTransactions],
	);

	return (
		<>
			<ProgressStepper
				currentStep={paidTransactions}
				totalSteps={totalTransactions}
			/>
			<FlashList
				ref={flatListRef}
				onLayout={handleLayoutChange}
				scrollEnabled={false}
				data={transactions}
				style={styles.container}
				contentContainerStyle={styles.content}
				keyExtractor={({ to_receipt_id }) => to_receipt_id.toString()}
				renderItem={({ item }) => (
					<View style={{ minWidth: minItemWidth }}>
						<TransactionView
							transaction={item}
							onPay={() => handlePay(item.transaction_id.toString())}
							paying={isPending}
						/>
					</View>
				)}
				horizontal
			/>
		</>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {},
	content: {
		width: "100%",
	},
	transactionContainer: {
		width: "100%",
		flex: 1,
		rowGap: theme.gap(2),
	},
	transactionTitle: {
		textAlign: "center",
		marginTop: theme.gap(4),
	},
	transactionButton: {
		marginTop: theme.gap(5),
	},
}));
