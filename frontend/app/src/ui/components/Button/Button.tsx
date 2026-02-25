import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useCallback, useMemo } from "react";
import { Pressable } from "react-native";
import { renderSlot } from "@/ui/utils/renderSlot";
import { Spinner } from "../Spinner";
import { Text } from "../Text";
import { ButtonSizeToIconSize } from "./Button.consts";
import { styles } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

export function Button({
	onPress,
	children,
	variant = "filled",
	style: containerStyles,
	icon,
	loading = false,
	size = "regular",
	disabled = false,
	...a11yProps
}: ButtonProps) {
	styles.useVariants({ variant, size });

	const Icon = renderSlot(icon, {
		color: styles.icon.color,
		size: ButtonSizeToIconSize[size],
	});

	const noContent = typeof children === "undefined";

	const Content = useMemo(() => {
		if (loading) return <Spinner />;
		if (noContent) return Icon;
		return (
			<>
				{Icon}
				<Text style={styles.text} variant="body">
					{children}
				</Text>
			</>
		);
	}, [Icon, children, loading, noContent]);

	const handleOnPress = useCallback(() => {
		if (loading || disabled) return;
		onPress?.();
	}, [disabled, loading, onPress]);

	if (isLiquidGlassAvailable()) {
		return (
			<GlassView
				isInteractive={!loading && !disabled}
				onTouchEnd={handleOnPress}
				style={[
					styles.container,
					styles.borderRadius(noContent),
					{ backgroundColor: undefined },
					containerStyles,
				]}
				tintColor={styles.container.backgroundColor}
				accessibilityRole="button"
				accessibilityState={{
					disabled: loading || disabled,
				}}
				{...a11yProps}
			>
				{Content}
			</GlassView>
		);
	}

	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.container,
				styles.borderRadius(noContent),
				containerStyles,
			]}
			disabled={loading}
			accessibilityRole="button"
			accessibilityState={{
				disabled: loading,
			}}
			{...a11yProps}
		>
			{Content}
		</Pressable>
	);
}
