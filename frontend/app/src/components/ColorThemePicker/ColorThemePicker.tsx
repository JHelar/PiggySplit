import { useCallback } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import { ColorTheme } from "@/api/group";
import type { ColorThemePickerProps } from "./ColorThemePicker.types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ColorThemeOptionProps = {
	theme: ColorTheme;
	onPress(theme: ColorTheme): void;
	selected: boolean;
};
function ColorThemeOption({ theme, onPress, selected }: ColorThemeOptionProps) {
	styles.useVariants({
		theme,
	});

	const selectedColor = styles.colorOptionSelected.color;
	const unselectedColor = styles.colorOption.backgroundColor;

	const style = useAnimatedStyle(() => {
		return {
			backgroundColor: withTiming(selected ? selectedColor : unselectedColor),
		};
	});

	return (
		<AnimatedPressable
			style={[styles.colorOption, style]}
			onPress={() => onPress(theme)}
		/>
	);
}

export function ColorThemePicker<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ field }: ColorThemePickerProps<TFieldValues, TName>) {
	const onSelectColor = useCallback(
		(theme: ColorTheme) => {
			field?.onChange(theme);
			field?.onBlur();
		},
		[field?.onBlur, field?.onChange],
	);

	const Options = Object.values(ColorTheme.enum).map((theme) => (
		<ColorThemeOption
			key={theme}
			theme={theme}
			onPress={onSelectColor}
			selected={field?.value === theme}
		/>
	));
	return <View style={styles.container}>{Options}</View>;
}

const styles = StyleSheet.create((theme) => ({
	container: {
		padding: theme.gap(2),
		borderRadius: theme.radius.large,
		borderColor: theme.border.primary,
		borderWidth: 1,
		backgroundColor: theme.surface.secondary,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	colorOptionSelected: {
		variants: {
			theme: {
				"color_theme:blue": {
					color: theme.colorPicker.blue.selected,
				},
				"color_theme:green": {
					color: theme.colorPicker.green.selected,
				},
			},
		},
	},
	colorOption: {
		width: 44,
		height: 44,
		borderRadius: 44,
		borderWidth: 2,
		variants: {
			theme: {
				"color_theme:blue": {
					backgroundColor: theme.colorPicker.blue.background,
					borderColor: theme.colorPicker.blue.border,
				},
				"color_theme:green": {
					backgroundColor: theme.colorPicker.green.background,
					borderColor: theme.colorPicker.green.border,
				},
			},
		},
	},
}));
