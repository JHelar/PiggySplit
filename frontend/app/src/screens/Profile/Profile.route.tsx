import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Button } from "@/ui/components/Button";

export const ProfileRouteOptions: ExtendedStackNavigationOptions = {
	headerRight() {
		const router = useRouter();
		return (
			<Button
				header
				variant="ghost"
				onPress={() => router.push("/Profile/Edit")}
			>
				<Trans>Edit</Trans>
			</Button>
		);
	},
};
