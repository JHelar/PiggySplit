import { View } from "react-native";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import type { Extendable } from "@/ui/ui.types";
import { renderSlot } from "@/ui/utils/renderSlot";
import type { ScreenContentFooterProps } from "./ScreenContentFooter.types";

export const FOOTER_HEIGHT = 44 + UnistylesRuntime.insets.bottom;

export function ScreenContentFooterSpacer({ style }: Extendable) {
	return <View style={[styles.spacer, style]}></View>;
}

export function ScreenContentFooter({
	primary,
	secondary,
	style: containerStyles,
}: ScreenContentFooterProps) {
	const Primary = renderSlot(primary, {
		style: styles.button,
	});
	const Secondary = renderSlot(secondary, {
		style: styles.button,
	});

	return (
		<View style={[styles.container, containerStyles]}>
			{Secondary}
			{Primary}
		</View>
	);
}

const styles = StyleSheet.create((theme, rt) => ({
	button: {},
	spacer: {
		height: FOOTER_HEIGHT + theme.gap(2),
	},
	container: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		width: rt.screen.width,
		columnGap: theme.gap(2),
		paddingRight: theme.gap(2) + rt.insets.right,
		paddingLeft: theme.gap(2) + rt.insets.left,
		height: FOOTER_HEIGHT,
		position: "absolute",
		bottom: Math.max(rt.insets.bottom, theme.gap(1.5)),
	},
}));
