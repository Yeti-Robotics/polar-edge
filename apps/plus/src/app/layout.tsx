import { SiteNavigation } from "@/components/layout/navigation";
import { ToastProvider } from "@repo/ui/components/toast";
import { Toaster } from "@repo/ui/components/toaster";
import { Libre_Franklin } from "next/font/google";
import "@repo/ui/globals.css";

const libreFranklin = Libre_Franklin({
	subsets: ["latin"],
	variable: "--font-libre-franklin",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${libreFranklin.variable} dark font-sans antialiased`}
			>
				<ToastProvider>
					<SiteNavigation />
					{children}
					<Toaster />
				</ToastProvider>
			</body>
		</html>
	);
}
