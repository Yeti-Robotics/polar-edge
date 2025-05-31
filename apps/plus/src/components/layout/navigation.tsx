import Link from "next/link";

export function SiteNavigation() {
	return (
		<header className="bg-background/50 container sticky top-0 z-50 flex h-12 items-center backdrop-blur-lg">
			<nav>
				<Link href="/">Plus</Link>
			</nav>
		</header>
	);
}
