import { google } from "googleapis";

const credentials = JSON.parse(
	Buffer.from(process.env.GOOGLE_CREDENTIALS!, "base64").toString("utf-8")
);

const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const googleSheetsClient = google.sheets({
	version: "v4",
	auth,
});
