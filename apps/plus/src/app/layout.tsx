import { SiteNavigation } from "@/components/layout/navigation";
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
				<SiteNavigation />
				{children}
			</body>
		</html>
	);
}
