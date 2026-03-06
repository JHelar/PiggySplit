import z from "zod";

export const User = z.object({
	first_name: z.string(),
	last_name: z.string(),
	phone_number: z.string(),
	email: z.string(),
});
export type User = z.output<typeof User>;
