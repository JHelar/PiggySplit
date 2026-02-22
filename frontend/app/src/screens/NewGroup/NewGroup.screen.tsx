import { zodResolver } from "@hookform/resolvers/zod";
import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { createGroup, UpsertGroup } from "@/api/group";
import { ColorThemePicker } from "@/components/ColorThemePicker";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { FormField } from "@/ui/components/FormField";
import { TextInput } from "@/ui/components/TextInput";

export function NewGroupScreen() {
	const { t } = useLingui();
	const router = useRouter();
	const { mutateAsync, isPending } = useMutation(createGroup());
	const form = useForm({
		resolver: zodResolver(UpsertGroup),
	});

	const onSubmit = form.handleSubmit(async (data) => {
		try {
			await mutateAsync(data);
		} finally {
			router.back();
		}
	});

	useScreenOptionsEffect({
		unstable_headerLeftItems() {
			return [
				{
					type: "button",
					label: t`Cancel`,
					onPress: router.back,
				},
			];
		},
		unstable_headerRightItems() {
			return [
				{
					type: "button",
					label: t`Save`,
					onPress: onSubmit,
				},
			];
		},
	});

	return (
		<View style={styles.container}>
			<FormField
				control={form.control}
				label={t`Group name`}
				name="display_name"
				input={<TextInput autoCapitalize="words" keyboardType="default" />}
			/>
			<FormField
				control={form.control}
				label={t`Currency`}
				name="currency_code"
				input={<TextInput autoCapitalize="words" keyboardType="default" />}
			/>
			<FormField
				control={form.control}
				label={t`Color theme`}
				name="color_theme"
				input={<ColorThemePicker />}
			/>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		rowGap: theme.gap(2),
	},
}));
