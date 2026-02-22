import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/user";
import { ScreenLayout } from "@/components/ScreenLayout";
import { ProfileScreen } from "@/screens/Profile";

export default function Profile() {
	const query = useQuery(getUser());

	return (
		<ScreenLayout variant="primary">
			<ProfileScreen query={query} />
		</ScreenLayout>
	);
}
