import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { renderSlot } from "@/ui/utils/renderSlot";
import type { InfoSquareProps } from "./InfoSquare.types";

export function InfoSquare({ cta, info, title, style }: InfoSquareProps) {
	const Title = renderSlot(title);
	const Info = renderSlot(info);
	const CTA = renderSlot(cta);

	return (
		<View style={[styles.container, style]}>
			{Title}
			{Info}
			{CTA}
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		height: 288,
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: theme.gap(4),
	},
}));
