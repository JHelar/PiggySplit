import { useQuery } from "@tanstack/react-query";
import { getGroups } from "@/api/group";
import { ScreenLayout } from "@/components/ScreenLayout";
import { GroupsScreen } from "@/screens/Groups";

export default function Groups() {
	const query = useQuery(getGroups());

	return (
		<ScreenLayout variant="primary">
			<GroupsScreen query={query} />
		</ScreenLayout>
	);
}
