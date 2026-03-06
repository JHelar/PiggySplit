import z from "zod";

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
