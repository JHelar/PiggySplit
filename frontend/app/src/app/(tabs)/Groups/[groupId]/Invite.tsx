import { useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { addMember } from "@/api/member";
import { AuthState, useAuth } from "@/auth";
import { Snackbar } from "@/components/SnackbarRoot";
import { useSignInStore } from "@/screens/SignIn";
import { Spinner } from "@/ui/components/Spinner";
import { includes } from "@/utils/includes";

const LoadingAuth = [AuthState.INITIALIZING];

export default function GroupInvite() {
	const authState = useAuth(({ state }) => state);
	const router = useRouter();
	const { mutateAsync: inviteMember } = useMutation(addMember());
	const { t } = useLingui();
	const params = useLocalSearchParams<"/(screens)/Groups/[groupId]/Invite">();

	useEffect(() => {
		async function process() {
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
				await inviteMember(params.groupId);
				router.replace("/(screens)/Groups");
				router.push({
					pathname: "/(screens)/Groups/[groupId]",
					params: {
						groupId: params.groupId,
					},
				});
			} catch {
				Snackbar.toast({
					text: t`Failed to join group, try again later!`,
				});
				router.dismissTo("/");
			}
		}
		process();
	}, [
		inviteMember,
		params.groupId,
		router.replace,
		t,
		authState,
		router.dismissTo,
		router.push,
	]);

	return <Spinner />;
}
