import { z } from "zod";

export const AttendanceRecordSchema = z.object({
	discordId: z.string(),
	name: z.string(),
	timestamp: z.string().refine(
		(val) => {
			const date = new Date(val);
			return !isNaN(date.getTime());
		},
		{
			message: "Invalid date format",
		}
	),
	isCheckingIn: z
		.string()
		.or(z.boolean())
		.transform((val) => {
			if (typeof val === "string") {
				return val.toLowerCase() === "true";
			}
			return val;
		}),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
