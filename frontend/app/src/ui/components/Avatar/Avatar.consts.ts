import type { IconProps } from "../Icon";
import type { AvatarType } from "./Avatar.types";

export const AvatarTypeToIcon: Record<AvatarType, IconProps | null> = {
	idle: null,
	payed: {
		name: "euro",
	},
	paying: {
		name: "euro",
	},
	ready: {
		name: "check",
	},
};

export const ICON_SIZE = 13;
