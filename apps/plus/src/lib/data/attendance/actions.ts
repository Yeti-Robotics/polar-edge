"use server";

import { writeAttendanceData } from "./dal";
import { getUserAttendance } from "./dto";
import { dateToEasternDateString, getEasternDateObject } from "./utils";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
		const lastCheckInTime = getEasternDateObject(
			new Date(lastRecord.timestamp)
		);
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
			await writeAttendanceData({
				timestamp: dateToEasternDateString(checkOutTime),
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
		await writeAttendanceData({
			timestamp: dateToEasternDateString(new Date()),
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
	const currentTime = getEasternDateObject(new Date());

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
			timestamp: dateToEasternDateString(inferredCheckInTime),
			isCheckingIn: true,
		});
	}
	try {
		await writeAttendanceData({
			timestamp: dateToEasternDateString(currentTime),
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
