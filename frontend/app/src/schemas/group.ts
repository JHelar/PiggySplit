import z from "zod";
import { Expense } from "./expense";
import { Member, MemberRole, MemberState } from "./member";

export const ColorTheme = z.enum({
	Blue: "color_theme:blue",
	Green: "color_theme:green",
});
export type ColorTheme = z.infer<typeof ColorTheme>;

export const GroupState = z.enum({
	Expenses: "group_state:expenses",
	Generating: "group_state:generating",
	Paying: "group_state:paying",
	Resolved: "group_state:resolved",
	Archived: "group_state:archived",
});
export type GroupState = z.infer<typeof GroupState>;

export const GroupBase = z.object({
	id: z.number(),
	group_name: z.string(),
	group_state: GroupState,
	group_theme: ColorTheme,
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
	total_expenses: z.number(),
	pay_per_member: z.number(),
	currency_code: z.string().default("SEK"),
	expenses: z.array(Expense),
	members: z.array(Member),
});
export type GroupBase = z.output<typeof GroupBase>;

export const GroupWithMembers = GroupBase.omit({ expenses: true });
export type GroupWithMembers = z.output<typeof GroupWithMembers>;

export const Group = GroupBase.and(
	z.object({
		member_role: MemberRole,
		member_state: MemberState,
		member_contribution: z.number(),
	}),
);
export type Group = z.output<typeof Group>;

export const Groups = z.array(GroupWithMembers);
export type Groups = z.output<typeof Groups>;
