import z from "zod";

export const TransactionState = z.enum({
	Unpaid: "transaction_state:unpaid",
	Paid: "transaction_state:Paid",
});

export type TransactionState = z.infer<typeof TransactionState>;

export const Transaction = z.object({
	from_receipt_id: z.number(),
	to_receipt_id: z.number(),
	transaction_id: z.number(),
	transaction_state: TransactionState,
	transaction_amount: z.number(),
	to_first_name: z.string(),
	to_last_name: z.string(),
	to_phone_number: z.string(),
});
export type Transaction = z.infer<typeof Transaction>;

export const Transactions = z.array(Transaction);
export type Transactions = z.infer<typeof Transactions>;
