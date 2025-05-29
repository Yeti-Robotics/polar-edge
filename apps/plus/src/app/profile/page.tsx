import { auth } from "@/lib/auth";
import { getUserAttendance } from "@/lib/data/attendance";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/table";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const session = await auth();

	if (!session) {
		redirect("/api/auth/signin");
	}

	const [attendance] = await Promise.allSettled([getUserAttendance()]);

	return (
		<main className="container">
			<h1 className="text-2xl font-extrabold md:text-3xl">Profile</h1>
			{attendance.status === "fulfilled" && attendance.value && (
				<section className="mt-4 space-y-4">
					<h2 className="text-xl font-extrabold md:text-2xl">
						Attendance
					</h2>
					{attendance.value.hours ? (
						<Card className="gap-0">
							<CardHeader>
								<CardTitle className="text-muted-foreground font-extrabold">
									Hours
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-4xl font-extrabold">
									{attendance.value.hours.toPrecision(3)}
								</p>
							</CardContent>
						</Card>
					) : (
						<p>
							Could not retrieve hour total. Please check with a
							mentor to see if your hours are logged correctly.
						</p>
					)}
					{attendance.value.attendanceRecords.length > 0 && (
						<div className="overflow-x-auto rounded-xl border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Check in/out</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{attendance.value.attendanceRecords.map(
										(record) => (
											<TableRow key={record.timestamp}>
												<TableCell>
													{record.timestamp}
												</TableCell>
												<TableCell>
													{record.isCheckingIn
														? "Check in"
														: "Check out"}
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</section>
			)}
		</main>
	);
}
