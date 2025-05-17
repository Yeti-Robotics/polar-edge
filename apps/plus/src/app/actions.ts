"use server";

import { signIn } from "@/lib/auth";
import { writeAttendanceData } from "@/lib/data/attendance/dal";
import { AttendanceRecordSchema } from "@/lib/data/attendance/model";

export const submitAttendance = async (data: FormData) => {
	"use server";
	const formData = Object.fromEntries(data.entries());
	const parsedData = AttendanceRecordSchema.omit({
		timestamp: true,
	}).parse({
		discordId: formData.discordId,
		name: formData.name,
		isCheckingIn: formData.isCheckingIn === "on",
	});
	await writeAttendanceData({
		...parsedData,
		timestamp: new Date().toLocaleString("en-US", {
			month: "2-digit",
			day: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
	});
};

export const signInAction = async () => {
	await signIn("discord", {
		redirectTo: "/",
	});
};
