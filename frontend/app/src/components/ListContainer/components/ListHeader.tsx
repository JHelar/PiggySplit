import { useHeaderHeight } from "@react-navigation/elements";
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type ListHeaderProps = {
	animatedIndex: SharedValue<number>;
};

export function ListHeader({ animatedIndex }: ListHeaderProps) {
	const headerHeight = useHeaderHeight();
	const style = useAnimatedStyle(() => ({
		height: interpolate(animatedIndex.value, [0, 1], [0, headerHeight]),
	}));
	return <Animated.View style={[styles.header, style]} />;
}
const styles = StyleSheet.create((theme) => ({
	header: {
		paddingBottom: theme.gap(4),
	},
}));
