import {
	AttendanceRecord,
	AttendanceRecordSchema,
} from "@/lib/data/attendance/model";
import { SheetClient } from "@repo/sheet-sdk";
import { revalidateTag } from "next/cache";

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

export const getAttendanceData = async () => {
	const client = getAttendanceClient();
	const data = await client.read(AttendanceRecordSchema, {
		range: "A:D",
	});
	return data;
};

export const writeAttendanceData = async (data: AttendanceRecord) => {
	const client = getAttendanceClient();
	await client.write(AttendanceRecordSchema, data);
	revalidateTag("attendance-data");
	console.log("revalidated attendance-data");
};
