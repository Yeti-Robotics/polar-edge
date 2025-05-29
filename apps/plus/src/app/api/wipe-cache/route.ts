import { revalidateTag } from "next/cache";

export async function GET() {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not allowed", { status: 403 });
	}
	revalidateTag("attendance-data");
	return new Response("Cache wiped", { status: 200 });
}
