import z from "zod";

export const MemberRole = z.enum({
	Admin: "member_role:admin",
	Regular: "member_role:regular",
});
export type MemberRole = z.infer<typeof MemberRole>;

export const MemberState = z.enum({
	Adding: "member_state:adding",
	Ready: "member_state:ready",
	Resolved: "member_state:resolved",
	Paying: "member_state:paying",
});
export type MemberState = z.infer<typeof MemberState>;

export const Member = z.object({
	first_name: z.string(),
	last_name: z.string(),
	member_role: MemberRole,
	member_state: MemberState,
	member_id: z.number(),
});
export type Member = z.output<typeof Member>;
