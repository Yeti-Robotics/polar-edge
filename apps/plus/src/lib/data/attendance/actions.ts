"use server";

import { writeAttendanceData } from "./dal";
import { getUserAttendance } from "./dto";

import { revalidatePath } from "next/cache";

export type AttendanceActionState = {
	success: boolean;
	message?: string;
};

export async function checkInUser(): Promise<AttendanceActionState> {
	const attendance = await getUserAttendance();
	if (!attendance) {
		return {
			success: false,
			message: "User not found",
		};
	}

	const lastRecord = attendance.records[attendance.records.length - 1];

	if (lastRecord && !attendance.canCheckIn) {
		const lastTimestamp = new Date(lastRecord.timestamp);
		const retroactiveCheckOutTimestamp = new Date(
			lastTimestamp.setHours(lastTimestamp.getHours() + 1.5)
		);
		if (retroactiveCheckOutTimestamp > new Date()) {
			return {
				success: false,
				message: "Retroactive check out time is in the future",
			};
		}

		await writeAttendanceData({
			timestamp: retroactiveCheckOutTimestamp.toISOString(),
			isCheckingIn: false,
		});
	}

	await writeAttendanceData({
		timestamp: new Date().toISOString(),
		isCheckingIn: true,
	});

	revalidatePath("/");

	return {
		success: true,
	};
}

export async function checkOutUser(): Promise<AttendanceActionState> {
	const attendance = await getUserAttendance();
	if (!attendance) {
		return {
			success: false,
			message: "User not found",
		};
	}

	const lastRecord = attendance.records[attendance.records.length - 1];

	if (lastRecord && !attendance.isCheckedIn) {
		const lastTimestamp = new Date(lastRecord.timestamp);
		const retroactiveCheckInTimestamp = new Date(
			lastTimestamp.getTime() - 1.5 * 60 * 60 * 1000
		);

		if (retroactiveCheckInTimestamp < lastTimestamp) {
			return {
				success: false,
				message:
					"Retroactive check in time would be before your last check out",
			};
		}

		await writeAttendanceData({
			timestamp: retroactiveCheckInTimestamp.toISOString(),
			isCheckingIn: true,
		});
		console.log("=== wrote retroactive check in");
	} else if (!lastRecord) {
		const retroactiveCheckInTimestamp = new Date(
			new Date().getTime() - 1.5 * 60 * 60 * 1000
		);
		await writeAttendanceData({
			timestamp: retroactiveCheckInTimestamp.toISOString(),
			isCheckingIn: true,
		});
	}

	await writeAttendanceData({
		timestamp: new Date().toISOString(),
		isCheckingIn: false,
	});

	revalidatePath("/");

	return {
		success: true,
	};
}
