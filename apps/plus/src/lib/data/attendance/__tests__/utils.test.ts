import { dateToEasternDateString, getEasternDateObject } from "../utils";

import moment from "moment-timezone";

describe("dateToFormattedString", () => {
	it("should return a formatted string with the date and time", () => {
		const date = moment
			.tz("2021-01-01 00:00:00", "America/New_York")
			.toDate();
		const result = dateToEasternDateString(date);
		expect(result).toBe("2021/01/01 00:00:00");
	});

	it("should return a formatted string with the date and time in the eastern timezone", () => {
		const date = moment
			.tz("2021-01-01 00:00:00", "America/Los_Angeles")
			.toDate();
		const result = dateToEasternDateString(date);
		expect(result).toBe("2021/01/01 03:00:00");
	});
});

describe("getEasternDateObject", () => {
	it("should return a date object with the correct timezone", () => {
		const date = moment
			.tz("2021-01-01 00:00:00", "America/New_York")
			.toDate();
		const result = getEasternDateObject(date);
		expect(result.toISOString()).toEqual("2021-01-01T05:00:00.000Z");
	});

	it("maintains the same date and time across timezones", () => {
		const date = moment
			.tz("2021-01-01 00:00:00", "America/Los_Angeles")
			.toDate();
		const result = getEasternDateObject(date);
		expect(result.toISOString()).toEqual("2021-01-01T08:00:00.000Z");
	});
});
