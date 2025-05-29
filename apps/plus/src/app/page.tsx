import {
	CheckInButton,
	CheckOutButton,
} from "@/components/attendance/attendance-buttons";
import { auth } from "@/lib/auth";
import { getUserAttendance } from "@/lib/data/attendance";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();
	if (!session) {
		redirect("/api/auth/signin");
	}

	const time = new Date();

	const attendance = await getUserAttendance();

	const isClockedIn =
		attendance && attendance.attendanceRecords.at(-1)?.isCheckingIn;

	let greeting = "Good morning";

	if (time.getHours() < 12) {
		greeting = "Good morning";
	} else if (time.getHours() < 18) {
		greeting = "Good afternoon";
	} else {
		greeting = "Good evening";
	}

	return (
		<main className="container mx-auto flex max-w-sm flex-col gap-4">
			<section>
				<Card className="gap-0 space-y-0">
					<CardHeader>
						<CardTitle className="text-lg font-medium">
							{greeting}, {session.user.name?.split(" ")[0]}
						</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground py-0 text-sm">
						<p>
							You are currently clocked{" "}
							{isClockedIn ? "in" : "out"}.
						</p>
					</CardContent>
				</Card>
			</section>
			<section className="flex flex-col gap-2">
				<div className="flex w-full justify-center gap-2">
					{isClockedIn ? <CheckOutButton /> : <CheckInButton />}
				</div>
			</section>
		</main>
	);
}
