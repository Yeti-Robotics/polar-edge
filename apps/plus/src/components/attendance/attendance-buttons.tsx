"use client";

import { checkInUser, checkOutUser } from "@/lib/data/attendance/actions";
import { Button } from "@repo/ui/components/button";
import { toast } from "@repo/ui/hooks/use-toast";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { useActionState, useEffect } from "react";

export const CheckInButton = () => {
	const [state, formAction, isPending] = useActionState(checkInUser, null);

	useEffect(() => {
		console.log("state", state);
		if (state?.success && state.message) {
			toast({
				variant: state.success ? "default" : "destructive",
				description: state.message,
			});
		}
	}, [state]);

	return (
		<form action={formAction}>
			<Button variant="default" disabled={isPending}>
				<LogInIcon />
				{isPending ? "Checking in..." : "Clock in"}
			</Button>
		</form>
	);
};

export const CheckOutButton = () => {
	const [state, formAction, isPending] = useActionState(checkOutUser, null);

	useEffect(() => {
		console.log("state out", state);
		if (state?.message) {
			console.log("toast");
			toast({
				variant: state.success ? "default" : "destructive",
				description: state.message,
			});
		}
	}, [state]);

	return (
		<form action={formAction}>
			<Button variant="secondary" disabled={isPending}>
				<LogOutIcon />
				{isPending ? "Checking out..." : "Clock out"}
			</Button>
		</form>
	);
};
