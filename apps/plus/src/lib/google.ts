import { google } from "googleapis";

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

export const getGoogleSheetsClient = () => {
	if (!sheetsClient) {
		const credentials = JSON.parse(
			Buffer.from(process.env.GOOGLE_CREDENTIALS!, "base64").toString(
				"utf-8"
			)
		);

		const auth = new google.auth.GoogleAuth({
			credentials,
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});

		sheetsClient = google.sheets({
			version: "v4",
			auth,
		});
	}
	return sheetsClient;
};
