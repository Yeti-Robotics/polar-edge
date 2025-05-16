import { NextRequest, NextResponse } from "next/server";
import { googleSheetsClient } from "@/lib/google";
import { z } from "zod";

const RecordSchema = z.object({
	discordId: z.string(),
	name: z.string(),
	timestamp: z.coerce.date(),
	isCheckingIn: z.coerce.boolean(),
});

export async function GET(request: NextRequest) {
	try {
		const result = await googleSheetsClient.spreadsheets.values.get({
			spreadsheetId: process.env.ATTENDANCE_SPREADSHEET_ID!,
			range: "A:D",
		});
		if (!result.data.values) {
			return NextResponse.json({ error: "No data found" });
		}
		const columnIndexMapping = result.data.values[0]?.reduce(
			(acc, value, index) => {
				return {
					...acc,
					[value]: index,
				};
			},
			{}
		);
		if (!columnIndexMapping) {
			return NextResponse.json({
				error: "No column index mapping found",
			});
		}
		console.log(columnIndexMapping);
		const records = result.data.values?.slice(1).map((value) => {
			return RecordSchema.parse({
				discordId: value[columnIndexMapping.discordId],
				name: value[columnIndexMapping.name],
				timestamp: value[columnIndexMapping.timestamp],
				isCheckingIn: value[columnIndexMapping.isCheckingIn] === "IN",
			});
		});
		return NextResponse.json(records);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to fetch data from Google Sheets" },
			{ status: 500 }
		);
	}
}
