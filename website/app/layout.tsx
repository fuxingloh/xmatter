import "./layout.css";

import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

import { ActiveLink } from "@/components/ActiveLink";
import { GitHub } from "@/components/icons/GitHub";
import { Xmatter } from "@/components/icons/Xmatter";
import Link from "next/link";
import { ThemeProvider, ThemeSelection } from "@/app/ThemeProvider";
import { SquareSlash } from "lucide-react";

export const metadata: Metadata = {
  metadataBase: new URL("https://xmatter.org"),
  title: {
    template: `%s – Xmatter`,
    default: `Xmatter - frontpage for address`,
  },
  description: "Structured metadata for smart contracts, the frontpage of an address.",
};

export default function RootLayout(props: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-mono-50 text-mono-950">
        <ThemeProvider>
          <Header />
          {props.children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-mono-200 border-b py-2">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-5">
          <ActiveLink
            href="/"
            mode="exact"
            className="hover:bg-invert/5 -mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
            activeClassName="!cursor-default hover:!bg-transparent"
          >
            <Xmatter className="size-4.5" />
            <div className="text-lg font-bold">Xmatter</div>
          </ActiveLink>

          <div className="bg-mono-300 h-4 w-px" />

          <div className="border-mono-200 flex min-w-54 items-center gap-1.25 rounded-md border px-2 py-0.75">
            <SquareSlash className="text-mono-400 size-4.5" />
            <span className="text-mono-500 text-[15px]">Quick Search</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-mono-600 -my-1 cursor-pointer px-1.5 py-1 text-sm">
            Docs
          </Link>
          <Link
            href="https://github.com/fuxingloh/xmatter"
            target="_blank"
            rel="noopener noreferrer"
            className="-mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
          >
            <GitHub className="size-4.5" />
          </Link>
          <div className="bg-mono-300 h-4 w-px" />
          <ThemeSelection />
        </div>
      </nav>
    </header>
  );
}
