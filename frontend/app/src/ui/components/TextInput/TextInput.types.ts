import type { FieldPath, FieldValues } from "react-hook-form";
import type { TextInputProps as RNTextInputProps } from "react-native";
import type { RenderSlot } from "@/ui/utils/renderSlot";
import type { FormFieldInput } from "../FormField";

export type TextInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { rightSlot?: RenderSlot } & RNTextInputProps &
	FormFieldInput<TFieldValues, TName>;
