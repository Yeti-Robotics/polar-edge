"use server";

import { writeAttendanceData } from "./dal";
import { getUserAttendance } from "./dto";

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
	const userAttendance = await getUserAttendance();
	if (!userAttendance) {
		return {
			success: false,
			error: "Failed to retrieve attendance data.",
		};
	}

	if (userAttendance.isCheckedIn) {
		return {
			success: false,
			error: "You are already checked in.",
		};
	}

	try {
		await writeAttendanceData({
			timestamp: new Date().toISOString(),
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
		throw new Error("User is not checked in.");
	}

	try {
		await writeAttendanceData({
			timestamp: currentTime.toISOString(),
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
