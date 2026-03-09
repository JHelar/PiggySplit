import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, rt) => ({
	container: {
		height: rt.screen.height,
		paddingLeft: theme.gap(2) + rt.insets.left,
		paddingRight: theme.gap(2) + rt.insets.right,
		variants: {
			variant: {
				primary: {
					backgroundColor: theme.background.primary,
				},
				surface: {
					backgroundColor: theme.background.secondary,
				},
			},
		},
	},
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
	},
}));
