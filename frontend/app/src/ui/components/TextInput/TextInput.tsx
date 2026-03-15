import type { FieldPath, FieldValues } from "react-hook-form";
import { TextInput as RNTextInput } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { TextInputProps } from "./TextInput.types";

export function TextInput<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	field,
	fieldState,
	formState,
	rightSlot,
	...inputProps
}: TextInputProps<TFieldValues, TName>) {
	return (
		<RNTextInput
			onChangeText={field?.onChange}
			{...field}
			{...inputProps}
			style={styles.input}
			accessibilityState={{
				disabled: formState?.disabled,
			}}
		/>
	);
}

const styles = StyleSheet.create((theme) => ({
	input: {
		backgroundColor: theme.surface.secondary,
		borderRadius: theme.radius.medium,
		color: theme.text.color.default,
		borderColor: theme.border.primary,
		borderWidth: 1,
		height: 52,
		alignContent: "center",
		alignItems: "center",
		paddingHorizontal: theme.gap(2),
		...theme.typography.body,
	},
}));
