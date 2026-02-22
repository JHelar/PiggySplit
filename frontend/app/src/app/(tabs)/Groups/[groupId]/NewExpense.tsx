import { ScreenLayout } from "@/components/ScreenLayout";
import { NewExpenseScreen } from "@/screens/NewExpense/NewExpense.screen";

export default function NewExpense() {
	return (
		<ScreenLayout variant="surface">
			<NewExpenseScreen />
		</ScreenLayout>
	);
}
