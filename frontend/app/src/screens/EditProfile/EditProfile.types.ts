import type { UseQueryResult } from "@tanstack/react-query";
import type { User } from "@/schemas/user";

export type EditProfileScreenProps = {
	query: UseQueryResult<User>;
};
