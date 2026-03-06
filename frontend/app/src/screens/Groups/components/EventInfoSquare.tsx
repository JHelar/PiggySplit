import { GlassView } from "expo-glass-effect";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useEventInfo } from "@/api/stream";
import { Button } from "@/ui/components/Button";
import { Icon } from "@/ui/components/Icon";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";

export function EventInfoSquare() {
	const latestExpense = useEventInfo(
		({ latestExpenseEvent }) => latestExpenseEvent,
	);
	if (latestExpense === undefined) return;

	return (
		<View style={styles.container}>
			<GlassView
				key={latestExpense.expense.id}
				style={styles.contentContainer}
				glassEffectStyle="regular"
			>
				<View style={styles.content}>
					<Icon
						name="initials"
						firstName={latestExpense.expense.first_name}
						lastName={latestExpense.expense.last_name}
					/>
					<Text variant="title">
						{formatCurrency(latestExpense.expense.cost, {
							currencyCode: latestExpense.expense.currency_code,
						})}
					</Text>
					<Text variant="subtitle">{latestExpense.expense.name}</Text>
				</View>
				<Button>{latestExpense.group.group_name}</Button>
			</GlassView>
		</View>
	);
}
const styles = StyleSheet.create((theme, rt) => ({
	scrollViewContainer: {
		width: rt.screen.width,
		flex: 0,
	},
	container: {
		flexDirection: "row",
	},
	contentContainer: {
		paddingVertical: theme.gap(2),
		paddingHorizontal: theme.gap(3),
		borderRadius: theme.radius.medium,
		alignItems: "center",
		rowGap: theme.gap(2),
	},
	content: {
		alignItems: "center",
		rowGap: theme.gap(1),
	},
}));
