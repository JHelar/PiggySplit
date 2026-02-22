import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getGroup } from "@/api/group";
import { ScreenLayout } from "@/components/ScreenLayout";
import {
	type EditExpenseRouteParams,
	EditExpenseScreen,
} from "@/screens/EditExpense";

export default function EditExpense() {
	const { groupId } = useLocalSearchParams<EditExpenseRouteParams>();
	const query = useQuery(getGroup(groupId));
	return (
		<ScreenLayout variant="surface">
			<EditExpenseScreen query={query} />
		</ScreenLayout>
	);
}
