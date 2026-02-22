import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { ScreenLayout } from "@/components/ScreenLayout";
import { SignInScreen, useSignInStore } from "@/screens/SignIn";

export default function SignIn() {
	const navigation = useNavigation();
	useEffect(() => {
		const remove = navigation.addListener("beforeRemove", () => {
			useSignInStore.getState().abort();
		});

		return () => {
			remove();
		};
	}, [navigation.addListener]);
	return (
		<ScreenLayout variant="surface">
			<SignInScreen />
		</ScreenLayout>
	);
}
