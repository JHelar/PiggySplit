import { useLingui } from "@lingui/react/macro";
import { GlassView } from "expo-glass-effect";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";
import type { Group } from "@/api/group";
import { Text } from "@/ui/components/Text";
import { formatCurrency } from "@/utils/formatValue";

type GroupInfoRowCardProps = {
	value: string;
	label: string;
};
function GroupInfoRowCard({ label, value }: GroupInfoRowCardProps) {
	return (
		<GlassView style={styles.cardContainer} glassEffectStyle="regular">
			<Text variant="title">{value}</Text>
			<Text variant="body">{label}</Text>
		</GlassView>
	);
}

type GroupInfoRowProps = {
	group: Group;
};

export function GroupInfoRow({ group }: GroupInfoRowProps) {
	const { t } = useLingui();

	const dept = group.member_contribution - group.pay_per_member;

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.container}
			disallowInterruption
			contentContainerStyle={styles.contentContainer}
		>
			<GroupInfoRowCard
				label={t`Total`}
				value={formatCurrency(group.total_expenses, {
					currencyCode: group.currency_code,
				})}
			/>
			<GroupInfoRowCard
				label={t`Pay per member`}
				value={formatCurrency(group.pay_per_member, {
					currencyCode: group.currency_code,
				})}
			/>
			<GroupInfoRowCard
				label={t`Your contribution`}
				value={formatCurrency(group.member_contribution, {
					currencyCode: group.currency_code,
				})}
			/>
			<GroupInfoRowCard
				label={dept > 0 ? t`Owed` : t`Dept`}
				value={formatCurrency(dept, {
					currencyCode: group.currency_code,
				})}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create((theme, rt) => ({
	container: {
		width: rt.screen.width,
	},
	contentContainer: {
		columnGap: theme.gap(2),
		flexDirection: "row",
		paddingHorizontal: theme.gap(2),
	},
	cardContainer: {
		paddingVertical: theme.gap(2),
		paddingHorizontal: theme.gap(3),
		borderRadius: theme.radius.medium,
		alignItems: "center",
		rowGap: theme.gap(0.5),
	},
}));
