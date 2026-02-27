import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useCallback } from "react";
import { addMember } from "@/api/member";
import { AuthState, useAuth } from "@/auth";
import { ScreenLayout } from "@/components/ScreenLayout";
import { Snackbar } from "@/components/SnackbarRoot";
import { useSignInStore } from "@/screens/SignIn";
import { Button } from "@/ui/components/Button";
import { includes } from "@/utils/includes";

const LoadingAuth = [AuthState.INITIALIZING];

export default function GroupInvite() {
	const authState = useAuth(({ state }) => state);
	const router = useRouter();
	const { mutateAsync: inviteMember } = useMutation(addMember());
	const { t } = useLingui();
	const params = useSearchParams();

	const groupId = params.get("group");

	const handleAcceptInvite = useCallback(async () => {
		if (!groupId) {
			router.dismissTo("/");
			return;
		}
		if (includes(LoadingAuth, authState)) return;
		if (authState === AuthState.UNAUTHORIZED) {
			const result = await useSignInStore.getState().start();
			if (result !== "success") {
				Snackbar.toast({
					text: t`Sign in failed, you need to sign in order to join a group!`,
				});
				router.dismissTo("/");
			}
		}
		try {
			await inviteMember(groupId);
			router.replace("/Groups");
			router.push({
				pathname: "/Groups/[groupId]",
				params: {
					groupId,
				},
			});
		} catch {
			Snackbar.toast({
				text: t`Failed to join group, try again later!`,
			});
			router.dismissTo("/");
		}
	}, [
		authState,
		groupId,
		inviteMember,
		router.dismissTo,
		router.push,
		router.replace,
		t,
	]);

	return (
		<ScreenLayout>
			<Button variant="filled" onPress={handleAcceptInvite}>
				Accept invite {groupId}
			</Button>
		</ScreenLayout>
	);
}
