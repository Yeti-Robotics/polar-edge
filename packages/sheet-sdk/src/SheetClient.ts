import { google, sheets_v4 } from "googleapis";
import { z } from "zod";
import { SheetConfig, ReadOptions, WriteOptions, SheetError } from "./types";

export class SheetClient {
	private sheets: sheets_v4.Sheets;
	private spreadsheetId: string;

	constructor(config: SheetConfig) {
		const auth = new google.auth.GoogleAuth({
			credentials: config.credentials,
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
		});

		this.sheets = google.sheets({ version: "v4", auth });
		this.spreadsheetId = config.spreadsheetId;
	}

	async read<T extends z.ZodType>(schema: T, options: ReadOptions) {
		try {
			const range = options.range;
			const response = await this.sheets.spreadsheets.values.get({
				spreadsheetId: this.spreadsheetId,
				range,
				majorDimension: options.majorDimension || "ROWS",
			});

			const values = response.data.values || [];
			const headers = values[0] || [];
			const rows = values.slice(1);

			const validRows: z.infer<T>[] = [];

			for (const row of rows) {
				const rowData: Record<string, unknown> = {};
				headers.forEach((header, index) => {
					rowData[header] = row[index];
				});

				const validatedData = schema.safeParse(rowData);
				if (validatedData.success) {
					validRows.push(validatedData.data);
				}
			}

			return validRows;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	async write<T extends z.ZodType>(
		schema: T,
		data: z.infer<T>,
		options: WriteOptions = {}
	) {
		try {
			// Validate the data against the schema
			const validatedData = schema.safeParse(data);
			if (!validatedData.success) {
				throw validatedData.error;
			}

			// Get the range to determine where to write
			const range = options.range || "A1";

			// Read the headers from the sheet
			const headerResponse = await this.sheets.spreadsheets.values.get({
				spreadsheetId: this.spreadsheetId,
				range:
					range.split("!").length > 1
						? range.split("!")[0] + "!1:1"
						: "1:1", // Get first row of the sheet
			});

			const headers = headerResponse.data.values?.[0] || [];

			// Create an array of values in the order of the headers
			const orderedValues = headers.map((header) => {
				// If the header exists in our data, use that value, otherwise use empty string
				return validatedData.data[header] ?? "";
			});

			// Append the values to the sheet
			const response = await this.sheets.spreadsheets.values.append({
				spreadsheetId: this.spreadsheetId,
				range,
				valueInputOption: options.valueInputOption || "USER_ENTERED",
				requestBody: {
					values: [orderedValues],
				},
			});

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	private handleError(error: unknown): SheetError {
		if (error instanceof z.ZodError) {
			return {
				code: "VALIDATION_ERROR",
				message: "Schema validation failed",
				details: error.errors,
			};
		}

		if (error instanceof Error) {
			return {
				code: "GOOGLE_API_ERROR",
				message: error.message,
			};
		}

		return {
			code: "UNKNOWN_ERROR",
			message: "An unknown error occurred",
		};
	}
}
