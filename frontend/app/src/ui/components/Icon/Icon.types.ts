import type { ViewStyle } from "react-native";
import type { A11YProps, Extendable } from "@/ui/ui.types";

export type IconName =
	| "create"
	| "sign-out"
	| "chevron-right"
	| "checkmark"
	| "lock"
	| "list-menu"
	| "pay"
	| "money";

export type IconInternalProps = {
	name: IconName;
	size: number;
	color: string;
} & Extendable<ViewStyle>;

export type IconProps = {
	size?: number;
	color?: string;
} & (
	| {
			name: IconName;
	  }
	| {
			name: "initials";
			firstName: string;
			lastName: string;
	  }
) &
	Extendable<ViewStyle> &
	A11YProps;
