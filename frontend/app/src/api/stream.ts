import { create } from "zustand";
import { queryClient, SSEEventSource } from "@/query";
import { buildApiUrl } from "@/query/fetch";
import { Group } from "@/schemas/group";
import { ExpenseEvent } from "@/schemas/stream";

export const useEventInfo = create<{
	latestExpenseEvent: ExpenseEvent | undefined;
}>(() => ({
	latestExpenseEvent: undefined,
}));

export function notifyLatestExpense(expense: ExpenseEvent) {
	useEventInfo.setState({ latestExpenseEvent: expense });
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
