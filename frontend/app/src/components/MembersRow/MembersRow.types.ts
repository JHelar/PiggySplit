import type { Member } from "@/api/member";
import type { Extendable } from "@/ui/ui.types";

export type MembersRowProps = {
	members: Member[];
} & Extendable;
