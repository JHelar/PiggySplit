import { zodResolver } from "@hookform/resolvers/zod";
import { Trans } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import z from "zod";
import { signIn } from "@/api/user";
import { Snackbar } from "@/components/SnackbarRoot";
import { Button } from "@/ui/components/Button";
import { FormField } from "@/ui/components/FormField";
import { Text } from "@/ui/components/Text";
import { TextInput } from "@/ui/components/TextInput";
import { useSignInStore } from "../SignIn.store";

export function EmailSubmit() {
	const { mutateAsync, isPending } = useMutation(signIn());
	const form = useForm({
		resolver: zodResolver(
			z.object({
				email: z.email({ error: "Email is required" }),
			}),
		),
	});

	const onSubmit = form.handleSubmit(async (formData) => {
		try {
			await mutateAsync(formData);
			useSignInStore.getState().transition("next", {
				email: formData.email,
			});
		} catch {
			Snackbar.toast({
				text: "Failed to send the message, check your inbox",
			});
			useSignInStore.getState().transition("error");
		}
	});

	return (
		<View style={styles.container}>
			<Text variant="headline" style={styles.heading}>
				<Trans>Enter email</Trans>
			</Text>
			<View style={styles.content}>
				<FormField
					control={form.control}
					label="Email"
					name="email"
					input={
						<TextInput
							autoCapitalize="none"
							autoComplete="email"
							keyboardType="email-address"
							textContentType="emailAddress"
						/>
					}
				/>
				<Button onPress={onSubmit} loading={isPending}>
					<Trans>Sign in or Register</Trans>
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create((theme) => ({
	container: {
		flex: 1,
		rowGap: theme.gap(6),
	},
	heading: {
		textAlign: "center",
	},
	content: {
		flex: 1,
		rowGap: theme.gap(2),
	},
}));
