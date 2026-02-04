import "./layout.css";
import "nextra-theme-docs/style.css";

import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";

import { ActiveLink } from "@/components/ActiveLink";
import { GitHub } from "@/components/icons/GitHub";
import { Xmatter } from "@/components/icons/Xmatter";
import Link from "next/link";

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
    <header className="border-mono-200 border-b py-3">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5">
        <ActiveLink
          href="/"
          mode="exact"
          className="hover:bg-invert/5 -mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
          activeClassName="!cursor-default hover:!bg-transparent"
        >
          <Xmatter className="size-4.5" />
          <div className="text-lg font-bold">Xmatter</div>
        </ActiveLink>

        <div>
          <div>Slash Search</div>
        </div>

        <div className="flex items-center gap-4">
          <div>Docs</div>
          <div>Theme Switch</div>
          <Link
            href="https://github.com/fuxingloh/xmatter"
            target="_blank"
            rel="noopener noreferrer"
            className="-mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
          >
            <GitHub className="size-4.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
