import {
	CheckInButton,
	CheckOutButton,
} from "@/components/attendance/attendance-buttons";
import { Clock } from "@/components/clock";
import { auth } from "@/lib/auth";
import { getUserAttendance } from "@/lib/data/attendance";
import { Card, CardContent } from "@repo/ui/components/card";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();
	if (!session) {
		redirect("/api/auth/signin");
	}

	const attendance = await getUserAttendance();

	const isClockedIn = attendance && attendance.records.at(-1)?.isCheckingIn;

	return (
		<main className="container mx-auto flex max-w-sm flex-col gap-4">
			<section>
				<Card className="bg-yeti-950 gap-0 space-y-0 p-0">
					<CardContent className="p-0 text-sm">
						<div className="flex justify-center px-4 py-2">
							<span className="bg-yeti-900 rounded-full px-2 py-1 text-xs font-medium">
								{isClockedIn ? "Clocked in" : "Clocked out"}
							</span>
						</div>
						<div className="flex justify-center pb-4 pt-2">
							<Clock />
						</div>
						<div className="bg-yeti-900 flex flex-col gap-2 rounded-b-lg px-4 py-2 text-white">
							<p className="flex items-center gap-2">
								Total hours:
								<span className="text-base font-bold">
									{attendance?.hours.toFixed(1)}
								</span>
							</p>
						</div>
					</CardContent>
				</Card>
			</section>
			<section className="flex flex-col gap-2">
				<div className="flex w-full justify-center gap-2">
					<CheckInButton />
					<CheckOutButton />
				</div>
			</section>
		</main>
	);
}
