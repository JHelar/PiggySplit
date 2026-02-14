import type { Extendable } from "@/ui/ui.types";
import type { RenderSlot } from "@/ui/utils/renderSlot";

export type InfoSquareProps = {
	title: RenderSlot;
	info: RenderSlot;
	cta?: RenderSlot;
} & Extendable;
