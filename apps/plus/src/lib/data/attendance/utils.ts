import moment from "moment-timezone";

export function dateToEasternDateString(date: Date) {
	return moment.tz(date, "America/New_York").format("YYYY/MM/DD HH:mm:ss");
}

export function getEasternDateObject(date: Date) {
	return moment.tz(date, "America/New_York").toDate();
}
