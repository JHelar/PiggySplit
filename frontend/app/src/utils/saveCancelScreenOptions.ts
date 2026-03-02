import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { router } from "expo-router";
import type { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";

const cancelMessage = msg`Cancel`;
const saveMessage = msg`Save`;

export function saveCancelScreenOptions(onSave: () => void | Promise<void>) {
	return {
		unstable_headerLeftItems() {
			return [
				{
					type: "button",
					label: i18n._(cancelMessage),
					icon: {
						type: "sfSymbol",
						name: "xmark",
					},
					onPress: router.back,
				},
			];
		},
		unstable_headerRightItems() {
			return [
				{
					type: "button",
					label: i18n._(saveMessage),
					variant: "done",
					icon: {
						type: "sfSymbol",
						name: "checkmark",
					},
					onPress: onSave,
				},
			];
		},
	} satisfies ExtendedStackNavigationOptions;
}
