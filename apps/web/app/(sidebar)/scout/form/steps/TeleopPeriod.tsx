"use client";

import { CardContent } from "@repo/ui/components/card";
import { CounterInput } from "../ui/CounterInput";
import { CoralInput } from "../ui/CoralInput";
import { FormField, FormItem, FormLabel } from "@repo/ui/components/form";
import { useFormContext } from "react-hook-form";

export function TeleopPeriod() {
	const form = useFormContext();

	return (
		<CardContent className="grid min-[375px]:grid-cols-2 gap-4">
			<CoralInput period="teleop" />
			<div className="flex flex-col gap-2">
				<FormField
					control={form.control}
					name="teleop.teleop_algae_processed"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm">Processor</FormLabel>
							<CounterInput min={0} {...field} />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="teleop.teleop_algae_netted"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm">Barge</FormLabel>
							<CounterInput min={0} {...field} />
						</FormItem>
					)}
				/>
			</div>
		</CardContent>
	);
}
