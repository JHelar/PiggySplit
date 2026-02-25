import { StyleSheet } from "react-native-unistyles";
import { ICON_SIZE } from "./Avatar.consts";

const CONTAINER_SIZE = 40;
const INITIALS_FONT_SIZE_MULTIPLIER = 0.5;

export const styles = StyleSheet.create((theme) => ({
	container: {
		width: CONTAINER_SIZE,
		height: CONTAINER_SIZE,
		borderRadius: CONTAINER_SIZE,

		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",

		backgroundColor: theme.surface.secondary,

		borderWidth: 2,

		...theme.elevation(1),
		shadowOffset: {
			height: 0,
			width: 1,
		},

		variants: {
			type: {
				idle: {
					borderColor: theme.surface.secondary,
				},
				payed: {
					borderColor: theme.surface.success,
				},
				paying: {
					borderColor: theme.surface.warning,
				},
				ready: {
					borderColor: theme.surface.success,
				},
			},
		},
	},
	initialsText: {
		fontSize: CONTAINER_SIZE * INITIALS_FONT_SIZE_MULTIPLIER,
		lineHeight: CONTAINER_SIZE * INITIALS_FONT_SIZE_MULTIPLIER * 1.2,
		color: theme.text.color.accent,
	},
	icon: {
		position: "absolute",
		bottom: -(ICON_SIZE / 2),
		right: -(ICON_SIZE / 2),

		color: theme.text.color.inverted,
		padding: theme.gap(1),
		alignItems: "center",
		justifyContent: "center",
		borderRadius: ICON_SIZE + theme.gap(1),
		variants: {
			type: {
				idle: {
					backgroundColor: theme.surface.secondary,
				},
				payed: {
					backgroundColor: theme.surface.success,
				},
				paying: {
					backgroundColor: theme.surface.warning,
				},
				ready: {
					backgroundColor: theme.surface.success,
				},
			},
		},
	},
}));
