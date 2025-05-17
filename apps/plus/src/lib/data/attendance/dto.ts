import "server-only";

import { getUserAttendanceData } from "@/lib/data/attendance/dal";

export const getUserAttendance = async () => {
	const data = await getUserAttendanceData();
	return data
		.map((record) => ({
			timestamp: record.timestamp,
			isCheckingIn: record.isCheckingIn,
		}))
		.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};
