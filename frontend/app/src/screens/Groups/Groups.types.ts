import type { UseQueryResult } from "@tanstack/react-query";
import type { Groups } from "@/schemas/group";

export type GroupsScreenProps = {
	query: UseQueryResult<Groups>;
};
