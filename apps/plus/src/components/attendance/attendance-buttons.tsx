"use client";

import {
	AttendanceActionState,
	userCheckIn,
	userCheckOut,
} from "@/lib/data/attendance/actions";
import { Button } from "@repo/ui/components/button";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { createContext, useContext } from "react";

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
	const { execute, isExecuting } = useAction(action);

	return (
		<AttendanceButtonContext.Provider value={{ isPending: isExecuting }}>
			<form className="w-full" action={formAction}>
				<Button
					variant={variant}
					type="submit"
					disabled={isPending}
					className="w-full cursor-pointer text-base"
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
			<LogInIcon />
			{isPending ? "Checking in..." : "Clock in"}
		</AttendanceButton>
	);
};

export const CheckOutButton = () => {
	const { isPending } = useContext(AttendanceButtonContext);
	return (
		<AttendanceButton action={userCheckOut} variant="secondary">
			<LogOutIcon />
			{isPending ? "Checking out..." : "Clock out"}
		</AttendanceButton>
	);
};
