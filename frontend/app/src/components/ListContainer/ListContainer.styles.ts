import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, rt) => ({
	container: {
		paddingVertical: theme.gap(1),
	},
	content: {
		paddingHorizontal: theme.gap(2),
	},
	footer(headerHeight: number) {
		return {
			height: rt.insets.bottom + headerHeight,
		};
	},
	spacer: {
		height: theme.gap(1),
	},
	itemMiddle: {
		rowGap: theme.gap(1),
	},
}));
