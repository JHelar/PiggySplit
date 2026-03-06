import z from "zod";
import { Expense } from "./expense";
import { Group } from "./group";

export const ExpenseEvent = z.object({
	expense: Expense,
	group: Group,
});
export type ExpenseEvent = z.infer<typeof ExpenseEvent>;
