import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getTransactions } from "@/api/transaction";
import { ScreenLayout } from "@/components/ScreenLayout";
import { type PayRouteParams, PayScreen } from "@/screens/Pay";

export default function Pay() {
	const params = useLocalSearchParams<PayRouteParams>();
	const query = useQuery(getTransactions(params.groupId));

	return (
		<ScreenLayout variant="primary">
			<PayScreen query={query} groupId={params.groupId} />
		</ScreenLayout>
	);
}
