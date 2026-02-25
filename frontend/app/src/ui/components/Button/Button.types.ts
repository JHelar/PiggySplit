import type { ReactNode } from "react";
import type { UnistylesVariants } from "react-native-unistyles";
import type { A11YProps, Extendable, PressableComponent } from "@/ui/ui.types";
import type { RenderSlot } from "@/ui/utils/renderSlot";
import type { IconProps } from "../Icon";
import type { styles } from "./Button.styles";

export type ButtonProps = {
	children?: ReactNode;
	loading?: boolean;
	icon?: RenderSlot<IconProps>;
	disabled?: boolean;
} & UnistylesVariants<typeof styles> &
	PressableComponent &
	A11YProps &
	Extendable;
