import { useMemo } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type {
	ProgressStepProps,
	ProgressStepperProps,
} from "./ProgressStepper.types";

function ProgressStep({ active }: ProgressStepProps) {
	styles.useVariants({
		active,
	});
	return (
		<View
			importantForAccessibility="no"
			accessible={false}
			accessibilityElementsHidden
			style={styles.step}
		></View>
	);
}

export function ProgressStepper({
	currentStep,
	totalSteps,
	style,
}: ProgressStepperProps) {
	const steps = useMemo(
		() => Array.from({ length: totalSteps }, (_, i) => i + 1),
		[totalSteps],
	);

	if (totalSteps < 2) return null;

	return (
		<View
			style={[styles.container, style]}
			accessibilityRole="progressbar"
			accessibilityValue={{
				min: 0,
				max: totalSteps,
				now: currentStep,
			}}
		>
			{steps.map((step) => (
				<ProgressStep key={step} active={step === currentStep} />
			))}
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flexDirection: "row",
		columnGap: theme.gap(1),
		justifyContent: "center",
	},
	step: {
		borderRadius: theme.radius.medium,
		height: 8,
		width: 42,
		variants: {
			active: {
				true: {
					backgroundColor: theme.surface.inverted,
				},
				false: {
					backgroundColor: theme.surface.secondary,
				},
			},
		},
	},
}));
