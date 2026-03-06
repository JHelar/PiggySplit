import type { Member } from "@/schemas/member";
import type { Extendable } from "@/ui/ui.types";

export type MembersRowProps = {
	members: Member[];
} & Extendable;
