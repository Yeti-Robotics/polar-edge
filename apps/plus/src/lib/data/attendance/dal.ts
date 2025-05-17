import "server-only";

import { auth } from "@/lib/auth";
import {
	AttendanceRecord,
	AttendanceRecordSchema,
} from "@/lib/data/attendance/model";
import { SheetClient } from "@repo/sheet-sdk";
import { revalidateTag, unstable_cache } from "next/cache";

let client: SheetClient | null = null;

const getAttendanceClient = () => {
	if (client) return client;

	const credentials = JSON.parse(
		Buffer.from(process.env.GOOGLE_CREDENTIALS!, "base64").toString("utf-8")
	);

	client = new SheetClient({
		credentials,
		spreadsheetId: process.env.ATTENDANCE_SPREADSHEET_ID!,
	});

	return client;
};

/**
 * Cached function to get all attendance data server-side
 */
const getAttendanceData = unstable_cache(
	async () => {
		const client = getAttendanceClient();
		const data = await client.read(AttendanceRecordSchema, {
			range: "A:D",
		});

		return data;
	},
	[],
	{
		tags: ["attendance-data"],
		revalidate: 60 * 60, // once an hour
	}
);

/**
 * Get all attendance data for a user
 */
export const getUserAttendanceData = async () => {
	const session = await auth();
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}
	const data = await getAttendanceData();
	return data.filter((record) => record.discordId === session.user.id);
};

export const writeAttendanceData = async (data: AttendanceRecord) => {
	const client = getAttendanceClient();
	await client.write(AttendanceRecordSchema, data);
	revalidateTag("attendance-data");
	console.log("revalidated attendance-data");
};
