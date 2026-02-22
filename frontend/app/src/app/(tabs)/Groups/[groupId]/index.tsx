import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getGroup } from "@/api/group";
import { ScreenLayout } from "@/components/ScreenLayout";
import { GroupScreen } from "@/screens/Group";
import type { GroupRouteParams } from "@/screens/Group/Group.route";

export default function Group() {
	const { groupId } = useLocalSearchParams<GroupRouteParams>();
	const query = useQuery(getGroup(groupId));

	return (
		<ScreenLayout variant="primary">
			<GroupScreen query={query} />
		</ScreenLayout>
	);
}
