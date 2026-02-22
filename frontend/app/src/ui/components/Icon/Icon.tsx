import { Host, Image } from "@expo/ui/swift-ui";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
	Platform,
	type StyleProp,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Text } from "../Text";
import {
	DEFAULT_ICON_INITIALS_SIZE,
	DEFAULT_ICON_SIZE,
	IconNameToMaterialIcon,
	IconNameToSFIcon,
	INITIALS_FONT_SIZE_MULTIPLIER,
} from "./Icon.consts";
import type { IconInternalProps, IconProps } from "./Icon.types";

function SFIcon({ name, size, color, style }: IconInternalProps) {
	return (
		<Host style={style} matchContents>
			<Image size={size} color={color} systemName={IconNameToSFIcon[name]} />
		</Host>
	);
}

function MaterialIcon({ name, size, color, style }: IconInternalProps) {
	return (
		<MaterialIcons
			style={style as StyleProp<TextStyle>}
			size={size}
			color={color}
			name={IconNameToMaterialIcon[name]}
		/>
	);
}

const InternalIcon = Platform.select({
	android: MaterialIcon,
	ios: SFIcon,
	macos: SFIcon,
	native: MaterialIcon,
	web: MaterialIcon,
	windows: MaterialIcon,
});

export function Icon({
	style: containerStyles,
	size,
	color,
	...props
}: IconProps) {
	if (props.name === "initials") {
		return (
			<View
				{...props}
				style={[styles.initials(size), containerStyles as ViewStyle]}
				accessibilityLabel={`${props.firstName} ${props.lastName}`}
			>
				<Text
					variant="xsmall"
					importantForAccessibility="no"
					accessibilityElementsHidden
					style={styles.initialsText(size)}
				>
					{`${props.firstName.at(0)}${props.lastName.at(0)}`.toLocaleUpperCase()}
				</Text>
			</View>
		);
	}
	return (
		<InternalIcon
			color={color ?? styles.icon.color}
			name={props.name}
			size={size ?? DEFAULT_ICON_SIZE}
			style={containerStyles}
		/>
	);
}

const styles = StyleSheet.create((theme) => ({
	icon: {
		color: theme.text.color.accent,
	},
	initials(size = DEFAULT_ICON_INITIALS_SIZE) {
		return {
			width: size,
			height: size,
			borderRadius: size,
			backgroundColor: theme.surface.secondary,
			alignItems: "center",
			justifyContent: "center",
			textAlign: "center",
		};
	},
	initialsText(size = DEFAULT_ICON_INITIALS_SIZE) {
		return {
			fontSize: size * INITIALS_FONT_SIZE_MULTIPLIER,
			lineHeight: size * INITIALS_FONT_SIZE_MULTIPLIER * 1.2,
			color: theme.text.color.accent,
		};
	},
}));
