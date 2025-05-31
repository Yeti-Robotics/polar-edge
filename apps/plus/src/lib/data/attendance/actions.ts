"use server";

import { writeAttendanceData } from "./dal";
import { getUserAttendance } from "./dto";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function dateToFormattedString(date: Date) {
	return date.toLocaleString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export type AttendanceActionState =
	| {
			success: false;
			error: string;
	  }
	| {
			success: true;
	  };

export const userCheckIn = async (): Promise<AttendanceActionState> => {
	const data = await getUserAttendance();
	if (!data) {
		return {
			success: false,
			error: "Failed to retrieve attendance data.",
		};
	}
	const lastRecord =
		data.attendanceRecords[data.attendanceRecords.length - 1];

	if (lastRecord && lastRecord.isCheckingIn) {
		const lastCheckInTime = new Date(lastRecord.timestamp);
		const checkOutTime = new Date(
			lastCheckInTime.getTime() + 3 * 60 * 60 * 1000
		);

		if (checkOutTime > new Date()) {
			return {
				success: false,
				error: "You are already checked in for this meeting.",
			};
		}

		try {
			console.log("=== writing retroactive check out ===");
			await writeAttendanceData({
				timestamp: dateToFormattedString(checkOutTime),
				isCheckingIn: false,
			});
		} catch (err) {
			console.error(err);
			return {
				success: false,
				error: "Failed trying to retroactively check out.",
			};
		}
	}

	try {
		console.log("=== writing check in ===");
		console.log(dateToFormattedString(new Date()));
		await writeAttendanceData({
			timestamp: dateToFormattedString(new Date()),
			isCheckingIn: true,
		});
		revalidatePath("/");
		return {
			success: true,
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: "Failed to check in.",
		};
	}
};

export const userCheckOut = async (): Promise<AttendanceActionState> => {
	const session = await auth();
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}
	if (!session.user.name) {
		throw new Error("Please set your name in Discord");
	}

	const data = await getUserAttendance();
	if (!data) {
		return {
			success: false,
			error: "Failed to retrieve attendance data.",
		};
	}

	const lastRecord =
		data.attendanceRecords[data.attendanceRecords.length - 1];
	const currentTime = new Date();

	if (lastRecord && !lastRecord.isCheckingIn) {
		const inferredCheckInTime = new Date(
			currentTime.getTime() - 1.5 * 60 * 60 * 1000 // half credit for the meeting
		);
		if (inferredCheckInTime < new Date(lastRecord.timestamp)) {
			return {
				success: false,
				error: "You are already checked out for this meeting.",
			};
		}
		await writeAttendanceData({
			timestamp: dateToFormattedString(inferredCheckInTime),
			isCheckingIn: true,
		});
	}
	try {
		await writeAttendanceData({
			timestamp: dateToFormattedString(currentTime),
			isCheckingIn: false,
		});
		revalidatePath("/");
		return {
			success: true,
		};
	} catch (error) {
		console.error(error);
		return {
			success: false,
			error: "Failed to check out.",
		};
	}
};
