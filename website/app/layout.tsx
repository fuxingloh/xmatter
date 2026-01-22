import "./layout.css";

import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";

import { ActiveLink } from "@/components/ActiveLink";
import { XMatter } from "@/components/icons/XMatter";

export const metadata: Metadata = {
  metadataBase: new URL("https://xmatter.org"),
  title: {
    template: `%s – XMatter`,
    default: `XMatter`,
  },
  description: "Structured metadata for smart contracts, the frontpage of an address.",
};

export default function RootLayout(props: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-mono-50 text-mono-950">
        <ThemeProvider>
          <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
            <ActiveLink
              href="/"
              mode="exact"
              className="hover:bg-invert/5 -mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
              activeClassName="!cursor-default hover:!bg-transparent"
            >
              <XMatter className="size-4.5" />
              <div className="text-lg font-bold">XMatter</div>
            </ActiveLink>
          </header>
          {props.children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
