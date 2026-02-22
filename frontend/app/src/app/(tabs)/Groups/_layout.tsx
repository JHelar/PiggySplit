import { Stack } from "expo-router";
import { EditExpenseRouteOptions } from "@/screens/EditExpense";
import { EditGroupRouteOptions } from "@/screens/EditGroup/EditGroup.route";
import { GroupsRouteOptions } from "@/screens/Groups";
import { NewExpenseRouteOptions } from "@/screens/NewExpense/NewExpense.route";
import { NewGroupRouteOptions } from "@/screens/NewGroup";
import { PayRouteOptions } from "@/screens/Pay";

export const unstable_settings = {
	initialRouteName: "index",
};

export default function GroupsLayout() {
	return (
		<Stack screenOptions={{ headerTransparent: true, headerTitle: "" }}>
			<Stack.Screen name="index" options={GroupsRouteOptions} />
			<Stack.Screen name="New" options={NewGroupRouteOptions} />

			<Stack.Screen name="[groupId]/index" />
			<Stack.Screen name="[groupId]/Edit" options={EditGroupRouteOptions} />
			<Stack.Screen
				name="[groupId]/NewExpense"
				options={NewExpenseRouteOptions}
			/>
			<Stack.Screen name="[groupId]/Pay" options={PayRouteOptions} />

			<Stack.Screen
				name="[groupId]/[expenseId]/Edit"
				options={EditExpenseRouteOptions}
			/>
		</Stack>
	);
}
