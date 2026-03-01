import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import { renderSlot } from "@/ui/utils/renderSlot";
import { styles } from "./ListItem.styles";
import type { ListItemProps } from "./ListItem.types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ListItem({
	left,
	middle,
	right,
	onPress,
	variant = "group",
	...a11yProps
}: ListItemProps) {
	styles.useVariants({
		variant,
	});
	const Left = renderSlot(left);
	const Middle = renderSlot(middle, {
		style: styles.middle,
	});
	const Right = renderSlot(right, {
		style: styles.right,
	});

	if (onPress) {
		return (
			<AnimatedPressable
				style={styles.container}
				onPress={onPress}
				{...a11yProps}
			>
				{Left}
				{Middle}
				{Right}
			</AnimatedPressable>
		);
	}

	return (
		<View style={styles.container} {...a11yProps}>
			{Left}
			{Middle}
			{Right}
		</View>
	);
}
