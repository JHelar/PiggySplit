import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme) => ({
	container: {
		paddingHorizontal: theme.gap(2),
		rowGap: theme.gap(2),
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.surface.secondary,
		borderRadius: theme.radius.medium,
		variants: {
			variant: {
				member: {
					paddingVertical: theme.gap(2),
				},
				group: {
					paddingVertical: theme.gap(1.5),
				},
				expense: {
					paddingVertical: theme.gap(2.5),
				},
			},
		},
	},
	middle: {
		flex: 1,
	},
	right: {
		flexDirection: "row",
		alignItems: "center",
		columnGap: theme.gap(2),
	},
}));
