import type { UnistylesVariants } from "react-native-unistyles";
import type { styles } from "./Avatar.style";

export type AvatarType = NonNullable<UnistylesVariants<typeof styles>["type"]>;

export type AvatarProps = {
	imageSrc?: string;
	firstName: string;
	lastName: string;
} & UnistylesVariants<typeof styles>;
