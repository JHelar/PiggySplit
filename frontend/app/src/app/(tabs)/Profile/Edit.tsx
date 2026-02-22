import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/user";
import { ScreenLayout } from "@/components/ScreenLayout";
import { EditProfileScreen } from "@/screens/EditProfile";

export default function EditProfile() {
	const query = useQuery(getUser());

	return (
		<ScreenLayout variant="surface">
			<EditProfileScreen query={query} />
		</ScreenLayout>
	);
}
