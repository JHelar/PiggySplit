import type { ButtonProps } from "./Button.types";

export const ButtonSizeToIconSize: Record<
	NonNullable<ButtonProps["size"]>,
	number
> = {
	mini: 15,
	small: 16,
	regular: 22,
	large: 24,
	extraLarge: 30,
};
