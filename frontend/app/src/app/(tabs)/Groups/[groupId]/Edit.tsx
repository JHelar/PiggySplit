import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getGroup } from "@/api/group";
import type { EditGroupRouteParams } from "@/screens/EditGroup/EditGroup.route";
import { EditGroupScreen } from "@/screens/EditGroup/EditGroup.screen";

export default function EditGroup() {
	const { groupId } = useLocalSearchParams<EditGroupRouteParams>();
	const query = useQuery(getGroup(groupId));

	return <EditGroupScreen query={query} />;
}
