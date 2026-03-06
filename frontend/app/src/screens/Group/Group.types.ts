import type { UseQueryResult } from "@tanstack/react-query";
import type { Group } from "@/schemas/group";

export type GroupScreenProps = {
	query: UseQueryResult<Group>;
};
