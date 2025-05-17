import { userCheckIn, userCheckOut } from "./actions";
import { signInAction } from "./actions";
import { Clock } from "./components/clock";

import { auth } from "@/lib/auth";
import { Button } from "@repo/ui/components/button";

export default async function Home() {
	const session = await auth();
	if (!session) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
				<div className="rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-lg">
					<h1 className="mb-6 text-center text-3xl font-bold text-white">
						Welcome to Attendance Tracker
					</h1>
					<form action={signInAction}>
						<Button
							type="submit"
							className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white transition-all hover:bg-indigo-700"
						>
							Sign in with Discord
						</Button>
					</form>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
			<div className="mx-auto max-w-2xl">
				<div className="rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-lg">
					<h1 className="mb-2 text-3xl font-bold text-white">
						Welcome back,{" "}
						{session.user.name?.split(" ")[0] || "there"}!
					</h1>
					<p className="mb-8 text-gray-300">
						Track your attendance with ease
					</p>

					<div className="mb-8">
						<Clock />
					</div>

					<div className="flex w-full justify-center gap-4">
						<form action={userCheckIn} className="space-y-4">
							<Button type="submit">Clock In</Button>
						</form>
						<form action={userCheckOut}>
							<Button variant="destructive" type="submit">
								Clock Out
							</Button>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
