import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { use } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ListContainer } from "@/components/ListContainer";
import { Clouds } from "@/components/SVG/Clouds";
import { Button } from "@/ui/components/Button";
import { Text } from "@/ui/components/Text";
import { GroupListItem } from "./components/GroupListItem";
import type { GroupsScreenProps } from "./Groups.types";

export function GroupsScreen({ query }: GroupsScreenProps) {
	const groups = use(query.promise);
	const router = useRouter();

	if (groups.length === 0) {
		return (
			<>
				<Clouds />
				<View style={styles.emptyContainer}>
					<Text variant="title" style={styles.emptyHeadline}>
						<Trans>Nothing to see here!</Trans>
					</Text>
					<Button
						variant="filled"
						onPress={() => router.navigate("/Groups/New")}
					>
						<Trans>Create new group</Trans>
					</Button>
				</View>
			</>
		);
	}

	return (
		<>
			<Clouds />
			<ListContainer
				data={groups}
				keyExtractor={({ id }) => id.toString()}
				renderItem={({ item }) => (
					<GroupListItem
						group={item}
						onPress={() => {
							router.navigate({
								pathname: "/Groups/[groupId]",
								params: {
									groupId: item.id,
								},
							});
						}}
					/>
				)}
			/>
		</>
	);
}

const styles = StyleSheet.create((theme, rt) => ({
	emptyContainer: {
		justifyContent: "center",
		rowGap: theme.gap(4),
		flex: 1,
	},
	emptyHeadline: {
		textAlign: "center",
	},
}));
