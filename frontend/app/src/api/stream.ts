import { create } from "zustand";
import { queryClient, SSEEventSource } from "@/query";
import { buildApiUrl } from "@/query/fetch";
import { Group } from "@/schemas/group";
import { ExpenseEvent } from "@/schemas/stream";

const MAX_QUEUE_SIZE = 5;

export const useEventInfo = create<{
	expenseQueue: ExpenseEvent[];
}>(() => ({
	expenseQueue: [],
}));

export function notifyLatestExpense(expense: ExpenseEvent) {
	if (
		useEventInfo
			.getState()
			.expenseQueue.some((event) => event.expense.id === expense.expense.id)
	)
		return;

	useEventInfo.setState((prev) => ({
		expenseQueue: [expense, ...prev.expenseQueue].splice(0, MAX_QUEUE_SIZE),
	}));
}

export function setLatestGroupExpenses(group: Group) {
	const latestExpense = group.expenses.at(0);
	if (latestExpense) {
		notifyLatestExpense({ group, expense: latestExpense });
	}
}

export function createUserStreamSource() {
	const url = buildApiUrl("user/sse");
	const source = new SSEEventSource(url, {
		debug: true,
		events: {
			expense: ExpenseEvent,
			group: Group,
		},
	});

	source.addEventListener("group", (event) => {
		queryClient.setQueryData(
			["groups", { id: event.data.id.toString() }],
			() => event.data,
		);
	});

	source.addEventListener("expense", (event) => {
		notifyLatestExpense(event.data);
	});

	source.addEventListener("error", console.error);

	return source;
}
