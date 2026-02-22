import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export const unstable_settings = {
	initialRouteName: "Groups",
};

export default function TabLayout() {
	return (
		<NativeTabs>
			<NativeTabs.Trigger name="Groups">
				<Label>Groups</Label>
				<Icon sf="house.fill" drawable="custom_android_drawable" />
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="Profile">
				<Icon sf="person.fill" drawable="custom_settings_drawable" />
				<Label>Profile</Label>
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
