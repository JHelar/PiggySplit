import type { Extendable } from "@/ui/ui.types";

export type PigProps = {
	canvas?: boolean;
	animation?: "swoop" | "resolved";
} & Extendable;
