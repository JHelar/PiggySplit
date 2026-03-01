import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import Animated, {
	interpolate,
	useDerivedValue,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function ListContainerBackdrop({
	animatedIndex,
	style,
}: BottomSheetBackdropProps) {
	const intensity = useDerivedValue<number | undefined>(() =>
		interpolate(animatedIndex.value, [0, 1], [0, 35]),
	);
	return (
		<AnimatedBlurView style={style} intensity={intensity} tint={"default"} />
	);
}
