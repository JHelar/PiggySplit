import type { IconProps } from "../Icon";
import type { AvatarType } from "./Avatar.types";

export const AvatarTypeToIcon: Record<AvatarType, IconProps | null> = {
	idle: null,
	payed: {
		name: "money",
	},
	paying: {
		name: "money",
	},
	ready: {
		name: "checkmark",
	},
};

export const ICON_SIZE = 12;
