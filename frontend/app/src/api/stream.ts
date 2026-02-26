import { queryClient, SSEEventSource } from "@/query";
import { buildApiUrl } from "@/query/fetch";
import { Group } from "./group";

export function createUserStreamSource() {
	const url = buildApiUrl("user/sse");
	const source = new SSEEventSource(url, {
		debug: true,
		events: {
			group: Group,
		},
	});

	source.addEventListener("group", (event) => {
		queryClient.setQueryData(
			["groups", { id: event.data.id.toString() }],
			() => event.data,
		);
	});

	return source;
}
