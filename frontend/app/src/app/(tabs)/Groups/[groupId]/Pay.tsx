import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { getTransactions } from "@/api/transaction";
import { type PayRouteParams, PayScreen } from "@/screens/Pay";

export default function Pay() {
	const params = useLocalSearchParams<PayRouteParams>();
	const query = useQuery(getTransactions(params.groupId));

	return <PayScreen query={query} groupId={params.groupId} />;
}
