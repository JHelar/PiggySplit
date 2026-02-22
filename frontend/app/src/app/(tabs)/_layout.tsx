import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "Groups",
};

export default function TabLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Groups" />
			<Stack.Screen name="Profile" />
		</Stack>
	);
}
