import { getAttendanceData } from "@/lib/data/attendance/dal";

export const getUserAttendance = async (discordId: string) => {
	const data = await getAttendanceData();
	return data.filter((record) => record.discordId === discordId);
};
