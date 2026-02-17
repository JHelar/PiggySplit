import { zodResolver } from "@hookform/resolvers/zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { createGroup, UpsertGroup } from "@/api/group";
import { ColorThemePicker } from "@/components/ColorThemePicker";
import { useScreenOptionsEffect } from "@/hooks/useScreenOptionsEffect";
import { Button } from "@/ui/components/Button";
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
		headerRight() {
			return (
				<Button variant="ghost" onPress={onSubmit} loading={isPending}>
					<Trans>Done</Trans>
				</Button>
			);
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
