import { Trans } from "@lingui/react/macro";
import { GlassView } from "expo-glass-effect";
import { useRouter } from "expo-router";
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
	const router = useRouter();

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
								<View style={styles.cardHeader}>
									<Icon
										name="initials"
										firstName={expense.expense.first_name}
										lastName={expense.expense.last_name}
									/>
									<Text variant="body">
										<Trans>Added expense</Trans>
									</Text>
								</View>
								<View style={styles.cardHeader}>
									<Text variant="subtitle">{expense.expense.name}</Text>
									<Text variant="title">
										{formatCurrency(expense.expense.cost, {
											currencyCode: expense.expense.currency_code,
										})}
									</Text>
								</View>
							</View>
							<Button
								onPress={() =>
									router.navigate({
										pathname: "/Groups/[groupId]",
										params: {
											groupId: expense.group.id,
										},
									})
								}
							>
								{expense.group.group_name}
							</Button>
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
		paddingHorizontal: theme.gap(2),
		flexDirection: "row",
		columnGap: theme.gap(1),
	},
	cardContainer: {
		paddingVertical: theme.gap(2),
		paddingHorizontal: theme.gap(3),
		borderRadius: theme.radius.medium,
		alignItems: "center",
		rowGap: theme.gap(2),
		width: rt.screen.width - theme.gap(4),
	},
	cardContent: {
		alignItems: "center",
		rowGap: theme.gap(1),
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		columnGap: theme.gap(1),
		alignItems: "center",
	},
}));
