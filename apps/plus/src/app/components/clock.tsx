"use client";

import { useEffect, useState } from "react";

export function Clock() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const hours = time.getHours().toString().padStart(2, "0");
	const minutes = time.getMinutes().toString().padStart(2, "0");
	const seconds = time.getSeconds().toString().padStart(2, "0");

	return (
		<div className="text-center">
			<div className="mb-2 font-mono text-6xl font-bold text-white">
				{hours}:{minutes}:{seconds}
			</div>
			<div className="font-medium text-gray-400">
				{time.toLocaleDateString("en-US", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				})}
			</div>
		</div>
	);
}
