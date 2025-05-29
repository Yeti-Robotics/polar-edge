"use client";

import {
	AttendanceActionState,
	userCheckIn,
	userCheckOut,
} from "@/lib/data/attendance/actions";
import { Button } from "@repo/ui/components/button";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { createContext, useActionState, useContext } from "react";

const AttendanceButtonContext = createContext<{
	isPending: boolean;
}>({
	isPending: false,
});

function AttendanceButton({
	action,
	variant,
	children,
}: {
	action: () => Promise<AttendanceActionState>;
	variant: React.ComponentProps<typeof Button>["variant"];
	children: React.ReactNode;
}) {
	const [, formAction, isPending] = useActionState(action, null);

	return (
		<AttendanceButtonContext.Provider value={{ isPending }}>
			<form action={formAction}>
				<Button
					variant={variant}
					type="submit"
					disabled={isPending}
					className="size-32 cursor-pointer flex-col rounded-full text-lg font-medium"
				>
					{children}
				</Button>
			</form>
		</AttendanceButtonContext.Provider>
	);
}

export const CheckInButton = () => {
	const { isPending } = useContext(AttendanceButtonContext);
	return (
		<AttendanceButton action={userCheckIn} variant="default">
			<LogInIcon className="size-8" />
			{isPending ? "Checking in..." : "Clock in"}
		</AttendanceButton>
	);
};

export const CheckOutButton = () => {
	const { isPending } = useContext(AttendanceButtonContext);
	return (
		<AttendanceButton action={userCheckOut} variant="secondary">
			<LogOutIcon className="size-12" />
			{isPending ? "Checking out..." : "Clock out"}
		</AttendanceButton>
	);
};
