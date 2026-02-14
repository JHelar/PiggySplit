import { StyleSheet } from "react-native-unistyles";

export const styles = StyleSheet.create((theme, rt) => ({
	icon: {
		...theme.elevation(1),
		shadowOffset: {
			height: 0,
			width: 1,
		},
		marginLeft: -theme.gap(1),
	},
	membersRow: {
		paddingLeft: theme.gap(1),
		flexDirection: "row",
	},
}));
