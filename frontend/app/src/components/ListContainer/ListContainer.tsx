import BottomSheet, {
	BottomSheetScrollView,
	useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { FlashList } from "@shopify/flash-list";
import { type ReactElement, useCallback, useMemo } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { UnistylesRuntime } from "react-native-unistyles";
import { ListContainerBackdrop } from "./components/ListContainerBackdrop";
import { ListHeader } from "./components/ListHeader";
import { styles } from "./ListContainer.styles";
import type { ListContainerProps } from "./ListContainer.types";

export function useBottomSheetScrollableCreator<T = any>(): (
	props: T,
	ref?: never,
) => ReactElement<T> {
	return useCallback(function useBottomSheetScrollableCreator(
		// @ts-expect-error
		{ data: _, ...props }: T,
		ref?: never,
	): ReactElement<T> {
		return (
			// @ts-expect-error
			<BottomSheetScrollView ref={ref} {...props} style={styles.scrollView} />
		);
	}, []);
}

export function ListContainer<Data>(props: ListContainerProps<Data>) {
	const BottomSheetScrollable = useBottomSheetScrollableCreator();
	const animationConfigs = useBottomSheetSpringConfigs({
		damping: 80,
		overshootClamping: true,
		stiffness: 500,
	});
	const headerHeight = useHeaderHeight();
	const animatedIndex = useSharedValue(0);

	const snapPoints = useMemo(
		() => [UnistylesRuntime.screen.height * 0.6, "100%"],
		[],
	);

	return (
		<BottomSheet
			animatedIndex={animatedIndex}
			animationConfigs={animationConfigs}
			enablePanDownToClose={false}
			animateOnMount={false}
			handleComponent={null}
			enableOverDrag={false}
			snapPoints={snapPoints}
			enableDynamicSizing={false}
			backgroundComponent={null}
			backgroundStyle={{ height: UnistylesRuntime.screen.height }}
			enableHandlePanningGesture={false}
			backdropComponent={ListContainerBackdrop}
		>
			<FlashList
				bounces={false}
				data={props.data}
				keyExtractor={props.keyExtractor}
				style={styles.container}
				ListHeaderComponent={<ListHeader animatedIndex={animatedIndex} />}
				ListFooterComponentStyle={styles.footer(headerHeight)}
				contentContainerStyle={styles.content}
				ListFooterComponent={<View />}
				renderItem={props.renderItem}
				ItemSeparatorComponent={() => <View style={styles.spacer} />}
				renderScrollComponent={BottomSheetScrollable}
			/>
		</BottomSheet>
	);
}
