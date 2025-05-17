"use server";

import { auth, signIn } from "@/lib/auth";
import { writeAttendanceData } from "@/lib/data/attendance/dal";
import { getUserAttendance } from "@/lib/data/attendance/dto";

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

export const userCheckIn = async () => {
	const session = await auth();
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}
	if (!session.user.name) {
		throw new Error("Please set your name in Discord");
	}
	const data = await getUserAttendance();
	const lastRecord = data[data.length - 1];

	if (lastRecord && lastRecord.isCheckingIn) {
		const lastCheckInTime = new Date(lastRecord.timestamp);
		const checkOutTime = new Date(
			lastCheckInTime.getTime() + 3 * 60 * 60 * 1000
		);

		await writeAttendanceData({
			discordId: parseInt(session.user.id),
			name: session.user.name,
			timestamp: dateToFormattedString(checkOutTime),
			isCheckingIn: false,
		});
	}

	await writeAttendanceData({
		discordId: parseInt(session.user.id),
		name: session.user.name,
		timestamp: dateToFormattedString(new Date()),
		isCheckingIn: true,
	});
};

export const userCheckOut = async () => {
	const session = await auth();
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}
	if (!session.user.name) {
		throw new Error("Please set your name in Discord");
	}

	const data = await getUserAttendance();
	const lastRecord = data[data.length - 1];
	const currentTime = new Date();

	console.log(lastRecord);

	if (lastRecord && !lastRecord.isCheckingIn) {
		const inferredCheckInTime = new Date(
			currentTime.getTime() - 3 * 60 * 60 * 1000
		);
		await writeAttendanceData({
			discordId: parseInt(session.user.id),
			name: session.user.name,
			timestamp: dateToFormattedString(inferredCheckInTime),
			isCheckingIn: true,
		});
	}
	await writeAttendanceData({
		discordId: parseInt(session.user.id),
		name: session.user.name,
		timestamp: dateToFormattedString(currentTime),
		isCheckingIn: false,
	});
};

export const signInAction = async () => {
	await signIn("discord", {
		redirectTo: "/",
	});
};
