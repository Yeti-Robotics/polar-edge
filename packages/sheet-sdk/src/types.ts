import { sheets_v4 } from "googleapis";

export type SheetConfig = {
	spreadsheetId: string;
	credentials: {
		client_email: string;
		private_key: string;
	};
};

export type ReadOptions = {
	range: string;
	majorDimension?: sheets_v4.Schema$ValueRange["majorDimension"];
};

export type WriteOptions = {
	range?: string;
	valueInputOption?: sheets_v4.Params$Resource$Spreadsheets$Values$Update["valueInputOption"];
};

export type SheetError = {
	code: string;
	message: string;
	details?: unknown;
};
