import { Platform, type TextStyle, type ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { accentPalette, staticPalette } from "./palettes";

const GAP_SIZE = 8;

export type TextVariants =
	| "headline"
	| "title"
	| "subtitle"
	| "body"
	| "small"
	| "xsmall";

export type TypographyTheme = {
	fontSize: number;
	fontWeight: TextStyle["fontWeight"];
	lineHeight: number;
};

export type AppTheme = {
	palette: (typeof accentPalette)["blueLight"];
	radius: {
		none: number;
		small: number;
		medium: number;
		large: number;
	};
	border: {
		primary: string;
	};
	background: {
		primary: string;
		secondary: string;
		transparent: string;
	};
	surface: {
		primary: string;
		secondary: string;
		transparent: string;
		inverted: string;
		warning: string;
		success: string;
	};
	text: {
		color: {
			default: string;
			inverted: string;
			accent: string;
			error: string;
		};
	};
	typography: Record<TextVariants, TypographyTheme>;
	colorPicker: {
		blue: {
			background: string;
			border: string;
			selected: string;
		};
		green: {
			background: string;
			border: string;
			selected: string;
		};
	};
	gap(type: number): number;
	elevation(
		level: number,
	): Pick<
		ViewStyle,
		"elevation" | "shadowOpacity" | "shadowRadius" | "shadowOffset"
	>;
};

const baseTheme: Pick<AppTheme, "radius" | "typography" | "gap" | "elevation"> =
	{
		radius: {
			none: 0,
			small: 4,
			medium: 8,
			large: 16,
		},
		typography: {
			headline: {
				fontSize: 32,
				fontWeight: 400,
				lineHeight: 32,
			},
			title: {
				fontSize: 22,
				fontWeight: 400,
				lineHeight: 22,
			},
			subtitle: {
				fontSize: 22,
				fontWeight: 400,
				lineHeight: 22,
			},
			body: {
				fontSize: 16,
				fontWeight: 400,
				lineHeight: 18,
			},
			small: {
				fontSize: 14,
				fontWeight: 600,
				lineHeight: 16,
			},
			xsmall: {
				fontSize: 12,
				fontWeight: 600,
				lineHeight: 12,
			},
		},
		gap(type) {
			return type * GAP_SIZE;
		},
		elevation(level) {
			return {
				...Platform.select({
					android: {
						elevation: level,
					},
					ios: {
						shadowOpacity: 0.1 * level,
						shadowRadius: level,
						shadowOffset: {
							height: 0,
							width: 0,
						},
					},
				}),
			};
		},
	};

const baseLightTheme: Pick<AppTheme, keyof typeof baseTheme | "colorPicker"> = {
	...baseTheme,
	colorPicker: {
		blue: {
			background: accentPalette.blueLight.accentOpacity600,
			border: accentPalette.blueLight.accent600,
			selected: accentPalette.blueLight.accent800,
		},
		green: {
			background: accentPalette.greenLight.accentOpacity600,
			border: accentPalette.greenLight.accent600,
			selected: accentPalette.greenLight.accent800,
		},
	},
};

const blueLight: AppTheme = {
	palette: accentPalette.blueLight,
	...baseLightTheme,
	border: {
		primary: accentPalette.blueLight.accent800,
	},

	background: {
		primary: accentPalette.blueLight.accent400,
		secondary: accentPalette.blueLight.accent200,
		transparent: staticPalette.light.grayOpacity200,
	},
	surface: {
		primary: accentPalette.blueLight.accent1100,
		inverted: staticPalette.light.gray1200,
		secondary: staticPalette.light.gray200,
		transparent: staticPalette.light.grayOpacity400,
		success: staticPalette.light.success,
		warning: staticPalette.light.warning,
	},
	text: {
		color: {
			default: staticPalette.light.black,
			accent: accentPalette.blueLight.accent1200,
			inverted: staticPalette.light.white,
			error: "#FF0000",
		},
	},
};
const greenLight: AppTheme = {
	palette: accentPalette.greenLight,
	...baseLightTheme,
	border: {
		primary: accentPalette.greenLight.accent800,
	},
	radius: {
		none: 0,
		small: 4,
		medium: 8,
		large: 16,
	},
	background: {
		primary: accentPalette.greenLight.accent400,
		secondary: accentPalette.greenLight.accent200,
		transparent: staticPalette.light.grayOpacity300,
	},
	surface: {
		inverted: staticPalette.light.gray1200,
		secondary: staticPalette.light.gray200,
		primary: accentPalette.greenLight.accent1100,
		transparent: staticPalette.light.grayOpacity400,
		success: staticPalette.light.success,
		warning: staticPalette.light.warning,
	},
	text: {
		color: {
			default: staticPalette.light.black,
			accent: accentPalette.greenLight.accent1200,
			inverted: staticPalette.light.white,
			error: "#FF0000",
		},
	},
};

const appThemes = {
	blueLight,
	greenLight,
} as const;

export type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
	export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
	themes: {
		blueLight,
		greenLight,
	},
	settings: {
		initialTheme: "blueLight",
	},
});
