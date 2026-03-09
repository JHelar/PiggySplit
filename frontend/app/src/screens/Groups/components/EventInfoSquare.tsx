import { GlassView } from "expo-glass-effect";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";
import { useEventInfo } from "@/api/stream";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { InfoSquare } from "@/ui/components/InfoSquare";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";

export function EventInfoSquare() {
	const latestExpenses = useEventInfo(({ expenseQueue }) => expenseQueue);

	if (latestExpenses.length === 0) return;

	return (
		<InfoSquare
			info={
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.container}
					disallowInterruption
					contentContainerStyle={styles.contentContainer}
				>
					{latestExpenses.map((expense) => (
						<GlassView
							key={expense.expense.id}
							style={styles.cardContainer}
							glassEffectStyle="regular"
						>
							<View style={styles.cardContent}>
								<Icon
									name="initials"
									firstName={expense.expense.first_name}
									lastName={expense.expense.last_name}
								/>
								<Text variant="title">
									{formatCurrency(expense.expense.cost, {
										currencyCode: expense.expense.currency_code,
									})}
								</Text>
								<Text variant="subtitle">{expense.expense.name}</Text>
							</View>
							<Button>{expense.group.group_name}</Button>
						</GlassView>
					))}
				</ScrollView>
			}
		/>
	);
}
const styles = StyleSheet.create((theme, rt) => ({
	container: {
		width: rt.screen.width,
	},
	contentContainer: {
		columnGap: theme.gap(2),
		paddingHorizontal: theme.gap(2),
		flexDirection: "row",
	},
	cardContainer: {
		paddingVertical: theme.gap(2),
		paddingHorizontal: theme.gap(3),
		borderRadius: theme.radius.medium,
		alignItems: "center",
		rowGap: theme.gap(2),
	},
	cardContent: {
		alignItems: "center",
		rowGap: theme.gap(1),
	},
}));
