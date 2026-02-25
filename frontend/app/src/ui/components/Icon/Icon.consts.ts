import type { ImageProps } from "@expo/ui/swift-ui";
import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import type { IconName } from "./Icon.types";

export const DEFAULT_ICON_SIZE = 24;
export const DEFAULT_ICON_INITIALS_SIZE = 30;
export const INITIALS_FONT_SIZE_MULTIPLIER = 0.5;

export const IconNameToSFIcon: Record<IconName, ImageProps["systemName"]> = {
	"sign-out": "rectangle.portrait.and.arrow.forward",
	create: "square.and.pencil",
	"chevron-right": "chevron.right",
	checkmark: "checkmark",
	lock: "lock",
	"list-menu": "line.horizontal.3.decrease",
	pay: "paperplane",
	money: "eurosign",
};

export const IconNameToMaterialIcon: Record<
	IconName,
	ComponentProps<typeof MaterialIcons>["name"]
> = {
	"sign-out": "exit-to-app",
	create: "edit-square",
	"chevron-right": "chevron-right",
	checkmark: "check",
	lock: "lock-outline",
	"list-menu": "more-vert",
	pay: "send",
	money: "euro",
};
