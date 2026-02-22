import { Stack } from "expo-router";
import { EditProfileRouteOptions } from "@/screens/EditProfile";
import { ProfileRouteOptions } from "@/screens/Profile";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function GroupsLayout() {
	return (
		<Stack
			screenOptions={{
				headerTransparent: true,
				headerTitle: "",
			}}
		>
			<Stack.Screen name="index" options={ProfileRouteOptions} />
			<Stack.Screen name="Edit" options={EditProfileRouteOptions} />
		</Stack>
	);
}
