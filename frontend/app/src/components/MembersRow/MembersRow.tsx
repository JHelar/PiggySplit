import { View } from "react-native";
import { Icon } from "@/ui/components/Icon";
import { styles } from "./MembersRow.styles";
import type { MembersRowProps } from "./MembersRow.types";

export function MembersRow({ members, style }: MembersRowProps) {
	return (
		<View style={[styles.membersRow, style]}>
			{members.map((member, index, members) => (
				<Icon
					key={index}
					name="initials"
					firstName={member.first_name}
					lastName={member.last_name}
					style={[styles.icon, { zIndex: members.length - index }]}
				/>
			))}
		</View>
	);
}
