import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
	container: {
		columnGap: theme.gap(1),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.surface.primary,
		variants: {
			size: {
				mini: {},
				small: {},
				regular: {
					height: 44,
					minWidth: 44,
					borderRadius: 44,
				},
				large: {},
				extraLarge: {},
			},
			variant: {
				filled: {
					backgroundColor: theme.surface.primary,
				},
				ghost: {
					backgroundColor: undefined,
				},
				"ghost-inverted": {
					backgroundColor: undefined,
				},
				destructive: {
					backgroundColor: theme.text.color.error,
				},
			},
		},
	},
	borderRadius(noContent: boolean) {
		if (noContent) {
			return {
				borderRadius: 9999,
			};
		}
		return {
			paddingHorizontal: theme.gap(1.5),
		};
	},
	text: {
		variants: {
			size: {
				mini: {},
				small: {},
				regular: {},
				large: {},
				extraLarge: {},
			},
			variant: {
				filled: {
					color: theme.text.color.inverted,
				},
				destructive: {
					color: theme.text.color.inverted,
				},
				ghost: {
					color: theme.text.color.default,
				},
				"ghost-inverted": {
					color: theme.text.color.inverted,
				},
			},
		},
	},
	icon: {
		color: theme.text.color.inverted,
		variants: {
			size: {
				mini: {},
				small: {},
				regular: {},
				large: {},
				extraLarge: {},
			},
			header: {
				true: {},
				false: {},
			},
			variant: {
				filled: {
					color: theme.text.color.inverted,
				},
				destructive: {
					color: theme.text.color.error,
				},
				ghost: {
					color: theme.text.color.default,
				},
				"ghost-inverted": {
					color: theme.text.color.inverted,
				},
			},
		},
	},
}));
