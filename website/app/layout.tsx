import "./layout.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import { ActiveLink } from "@/components/headless/ActiveLink";
import { NavigationIndicator } from "@/components/NavigationIndicator";
import { ThemeScript } from "@/components/Theme";

export const metadata: Metadata = {
  metadataBase: new URL("https://xmatter.org"),
  title: {
    template: `%s – xmatter`,
    default: `xmatter`,
  },
  description: "Structured metadata for smart contracts, the frontpage of an address.",
};

export default function RootLayout(props: { children: ReactNode }): ReactElement {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body className="text-mono-950 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <NavigationIndicator />
        <header className="flex items-center justify-between py-6">
          <ActiveLink
            href="/"
            mode="exact"
            className="hover:bg-invert/5 -mx-3 -my-1 rounded px-3 py-1"
            activeClassName="!cursor-default hover:!bg-transparent"
          >
            <div className="text-lg font-bold">xmatter</div>
          </ActiveLink>
        </header>
        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
