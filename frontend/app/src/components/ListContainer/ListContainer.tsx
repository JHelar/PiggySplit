import BottomSheet, {
	useBottomSheetScrollableCreator,
	useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useHeaderHeight } from "@react-navigation/elements";
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { View } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";
import { ListContainerBackdrop } from "./components/ListContainerBackdrop";
import { styles } from "./ListContainer.styles";
import type { ListContainerProps } from "./ListContainer.types";

export function ListContainer<Data>(props: ListContainerProps<Data>) {
	const BottomSheetScrollable = useBottomSheetScrollableCreator();
	const animationConfigs = useBottomSheetSpringConfigs({
		damping: 80,
		overshootClamping: true,
		stiffness: 500,
	});
	const headerHeight = useHeaderHeight();

	const snapPoints = useMemo(
		() => [UnistylesRuntime.screen.height * 0.45 + headerHeight, "100%"],
		[headerHeight],
	);

	return (
		<BottomSheet
			animationConfigs={animationConfigs}
			enablePanDownToClose={false}
			animateOnMount={false}
			handleComponent={null}
			enableOverDrag={false}
			snapPoints={snapPoints}
			enableDynamicSizing={false}
			backgroundComponent={null}
			backdropComponent={ListContainerBackdrop}
		>
			<FlashList
				bounces={false}
				data={props.data}
				keyExtractor={props.keyExtractor}
				style={styles.container}
				ListHeaderComponent={<View />}
				ListHeaderComponentStyle={[styles.header, { height: headerHeight }]}
				ListFooterComponentStyle={[styles.footer(headerHeight)]}
				contentContainerStyle={styles.content}
				ListFooterComponent={<View />}
				renderItem={props.renderItem}
				ItemSeparatorComponent={() => <View style={styles.spacer} />}
				renderScrollComponent={BottomSheetScrollable}
			/>
		</BottomSheet>
	);
}
