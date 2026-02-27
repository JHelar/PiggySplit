import type { NativeIntent } from "expo-router";
import { groupShareLinkId } from "@/utils/groupShareLink";

type RedirectSystemPathArguments = Parameters<
	NonNullable<NativeIntent["redirectSystemPath"]>
>[0];
export function redirectSystemPath({ path }: RedirectSystemPathArguments) {
	const parseResult = groupShareLinkId.safeParse(path);
	if (parseResult.success) {
		return `/Invite?group=${parseResult.data}`;
	}
	return path;
}
