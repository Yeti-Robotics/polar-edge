import { z } from "zod";

export const AttendanceRecordSchema = z.object({
	discordId: z.string(),
	name: z.string(),
	timestamp: z.string().refine(
		(val) => {
			const date = new Date(val);
			console.log(date);
			return !isNaN(date.getTime());
		},
		{
			message: "Invalid date format",
		}
	),
	isCheckingIn: z.coerce.boolean(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
