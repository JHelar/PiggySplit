import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { UnistylesRuntime } from "react-native-unistyles";
import type { ColorTheme } from "@/schemas/group";
import type { AppThemes } from "@/ui/setup";

export const ColorThemeToAppTheme: Record<ColorTheme, keyof AppThemes> = {
	"color_theme:blue": "blueLight",
	"color_theme:green": "greenLight",
};

export function useScreenFocusSetTheme(theme: ColorTheme) {
	useFocusEffect(
		useCallback(() => {
			UnistylesRuntime.setTheme(ColorThemeToAppTheme[theme]);
			return () => {
				UnistylesRuntime.setTheme("blueLight");
			};
		}, [theme]),
	);
}
