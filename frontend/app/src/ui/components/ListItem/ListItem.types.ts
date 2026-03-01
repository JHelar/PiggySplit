import type { UnistylesVariants } from "react-native-unistyles";
import type { A11YProps, Extendable, PressableComponent } from "@/ui/ui.types";
import type { RenderSlot } from "@/ui/utils/renderSlot";
import type { styles } from "./ListItem.styles";

export type ListItemProps = {
	middle?: RenderSlot<Extendable>;
	left?: RenderSlot<Extendable>;
	right?: RenderSlot<Extendable>;
} & PressableComponent &
	A11YProps &
	UnistylesVariants<typeof styles>;
