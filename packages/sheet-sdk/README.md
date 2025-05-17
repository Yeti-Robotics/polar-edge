# Sheet SDK

A type-safe wrapper around the Google Sheets API using Zod for schema validation.

## Installation

```bash
npm install sheet-sdk
# or
yarn add sheet-sdk
# or
pnpm add sheet-sdk
```

## Usage

```typescript
import { SheetSDK } from "sheet-sdk";
import { z } from "zod";

// Define your schema
const UserSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	age: z.number().int().positive(),
});

// Create schema configuration
const userSheet = {
	schema: UserSchema,
	range: "Users!A2:C", // Sheet name and range
};

// Initialize the SDK
const sdk = new SheetSDK({
	spreadsheetId: "your-spreadsheet-id",
	credentials: {
		client_email: "your-service-account-email",
		private_key: "your-private-key",
	},
});

// Read data
const users = await sdk.read(userSheet);

// Write data
await sdk.write(userSheet, [
	{ name: "John Doe", email: "john@example.com", age: 30 },
	{ name: "Jane Smith", email: "jane@example.com", age: 25 },
]);
```

## Features

- Type-safe operations using Zod schemas
- Automatic validation of data
- Flexible range specification
- Error handling with detailed error messages
- Support for both reading and writing operations

## API Reference

### SheetSDK

The main class for interacting with Google Sheets.

#### Constructor

```typescript
new SheetSDK(config: SheetConfig)
```

#### Methods

- `read<T>(schema: SheetSchema<T>, options?: ReadOptions): Promise<z.infer<T>[]>`
- `write<T>(schema: SheetSchema<T>, data: z.infer<T>[], options?: WriteOptions): Promise<void>`

### Types

- `SheetSchema<T>`: Configuration for a sheet with schema and range
- `SheetConfig`: Configuration for the SDK instance
- `ReadOptions`: Options for read operations
- `WriteOptions`: Options for write operations
- `SheetError`: Error type for SDK operations

## Error Handling

The SDK provides detailed error information through the `SheetError` type:

```typescript
type SheetError = {
	code: "VALIDATION_ERROR" | "GOOGLE_API_ERROR" | "UNKNOWN_ERROR";
	message: string;
	details?: unknown;
};
```

## License

ISC
