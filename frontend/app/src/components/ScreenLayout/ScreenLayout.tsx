import { useHeaderHeight } from "@react-navigation/elements";
import {
	createContext,
	type PropsWithChildren,
	Suspense,
	useCallback,
	useState,
} from "react";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import type { ColorTheme } from "@/schemas/group";
import {
	ScreenContent,
	type ScreenContentProps,
} from "@/ui/components/ScreenContent";
import { Spinner } from "@/ui/components/Spinner";
import type { AppThemes } from "@/ui/setup";

export const ThemeContext = createContext<{
	theme?: ColorTheme;
	setTheme(newTheme: ColorTheme): void;
}>({
	setTheme() {},
});

const ColorThemeToAppTheme: Record<ColorTheme, keyof AppThemes> = {
	"color_theme:blue": "blueLight",
	"color_theme:green": "greenLight",
};

export function ThemeProvider({ children }: PropsWithChildren) {
	const [colorTheme, setColorTheme] = useState<ColorTheme | undefined>();
	const setTheme = useCallback((newTheme: ColorTheme) => {
		UnistylesRuntime.setTheme(ColorThemeToAppTheme[newTheme]);
		setColorTheme(newTheme);
	}, []);

	return (
		<ThemeContext.Provider value={{ setTheme, theme: colorTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function ScreenLayout({
	children,
	variant,
	footer,
}: PropsWithChildren<Pick<ScreenContentProps, "variant" | "footer">>) {
	const headerHeight = useHeaderHeight();

	return (
		<ScreenContent
			variant={variant}
			footer={footer}
			style={styles.header(headerHeight, variant)}
		>
			<Suspense fallback={<Spinner />}>{children}</Suspense>
		</ScreenContent>
	);
}

const styles = StyleSheet.create((theme) => ({
	header(headerHeight: number, variant: ScreenContentProps["variant"]) {
		return {
			paddingTop: theme.gap(variant === "primary" ? 1 : 6) + headerHeight,
		};
	},
}));
