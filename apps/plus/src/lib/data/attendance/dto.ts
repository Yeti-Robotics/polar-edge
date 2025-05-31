import "server-only";

import { AttendanceRecord } from "./model";

import { getUserAttendanceData } from "@/lib/data/attendance/dal";
import { cache } from "react";

export class UserAttendance {
	private records: Omit<AttendanceRecord, "name" | "discordId">[];

	constructor(records: AttendanceRecord[]) {
		this.records = records
			.map((record) => ({
				timestamp: record.timestamp,
				isCheckingIn: record.isCheckingIn,
			}))
			.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
	}

	/**
	 * Calculates the hour difference between two dates
	 * @param checkInDate - The date of the check in
	 * @param checkOutDate - The date of the check out
	 * @returns The hour difference between the two dates
	 */
	private calculateHourDifference(checkInDate: Date, checkOutDate: Date) {
		return (
			(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
		);
	}

	get hours() {
		// attempt to reduce into an hour total
		// if duplicate check in/out, throw an error
		console.log(this.records);
		return this.records.reduce<{ in: null | Date; hours: number }>(
			(acc, curr) => {
				if (curr.isCheckingIn && !acc.in) {
					acc.in = new Date(curr.timestamp);
				} else if (curr.isCheckingIn && acc.in) {
					throw new Error("User is already checked in");
				} else if (!curr.isCheckingIn && acc.in) {
					acc.hours += this.calculateHourDifference(
						acc.in,
						new Date(curr.timestamp)
					);
					acc.in = null;
				} else {
					throw new Error(
						"User is not checked in and trying to check out"
					);
				}
				return acc;
			},
			{ in: null, hours: 0 }
		).hours;
	}

	get attendanceRecords() {
		return this.records;
	}
}

export const getUserAttendance = cache(async () => {
	try {
		const data = await getUserAttendanceData();
		return new UserAttendance(data);
	} catch (err) {
		console.error(err);
		return null;
	}
});
