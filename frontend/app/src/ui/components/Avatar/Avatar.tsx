import { View } from "react-native";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { AvatarTypeToIcon, ICON_SIZE } from "./Avatar.consts";
import { styles } from "./Avatar.style";
import type { AvatarProps } from "./Avatar.types";

export function Avatar({ firstName, lastName, type = "idle" }: AvatarProps) {
	styles.useVariants({
		type,
	});

	const iconProps = AvatarTypeToIcon[type];

	return (
		<View
			style={styles.container}
			accessibilityLabel={`${firstName} ${lastName}`}
		>
			<Text
				variant="xsmall"
				importantForAccessibility="no"
				accessibilityElementsHidden
				style={styles.initialsText}
			>
				{`${firstName.at(0)}${lastName.at(0)}`.toLocaleUpperCase()}
			</Text>
			{iconProps && (
				<Icon
					{...iconProps}
					style={styles.icon}
					size={ICON_SIZE}
					color={styles.icon.color}
				/>
			)}
		</View>
	);
}
