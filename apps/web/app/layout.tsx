import { DevTools } from "@/components/devtools/DevTools";
import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "@repo/ui/globals.css";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const libreFranklin = Libre_Franklin({
	subsets: ["latin"],
	variable: "--font-libre-franklin",
});

export const metadata: Metadata = {
	title: "Polar Edge Analytics",
	description: "A NC FRC Scouting Platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	// note that suppressHydrationWarning must be added b/c of next-themes
	// see: https://github.com/pacocoursey/next-themes
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${libreFranklin.variable} bg-background font-sans dark:prose-invert min-h-screen`}
			>
				{children}
				<DevTools />
			</body>
		</html>
	);
}