import "./layout.css";

import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

import { ActiveLink } from "@/components/ActiveLink";
import { GitHub } from "@/components/icons/GitHub";
import { Xmatter } from "@/components/icons/Xmatter";
import Link from "next/link";
import { ThemeProvider, ThemeSelection } from "@/app/ThemeProvider";
import { CmdKMenu, CmdKTrigger } from "@/app/CmdK";
import { SquareSlash } from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import { GitPullRequestCreateArrow } from "lucide-react";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://xmatter.org"),
  title: {
    template: `%s on Xmatter`,
    default: `Xmatter: README.md for Address`,
  },
  description:
    "Structured metadata for address and smart contracts. The README.md, icons, metadata, frontmatter registry for assets on-chain.",
  openGraph: {
    type: "website",
    siteName: "Xmatter",
    title: {
      template: `%s on Xmatter`,
      default: `Xmatter: README.md for Address`,
    },
    description:
      "Structured metadata for address and smart contracts. The README.md, icons, metadata, frontmatter registry for assets on-chain.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout(props: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`bg-mono-50 text-mono-950 ${jetBrainsMono.variable}`}>
        <ThemeProvider>
          <Header />
          {props.children}
          <CmdKMenu />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="border-mono-200 bg-mono-50 sticky top-0 z-10 border-b py-2">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5">
        <div className="flex items-center">
          <ActiveLink
            href="/"
            mode="exact"
            className="hover:bg-invert/5 -mx-3 -my-1 flex items-center gap-1.5 rounded px-3 py-1"
            activeClassName="!cursor-default hover:!bg-transparent"
          >
            <Xmatter className="size-4.5" />
            <div className="hidden text-base font-medium sm:block">Xmatter</div>
          </ActiveLink>

          <div className="bg-mono-300 ml-5 hidden h-4 w-px sm:block" />

          <CmdKTrigger className="border-mono-200 ml-5 flex items-center gap-1.25 rounded-md border px-2 py-0.75 sm:min-w-54">
            <SquareSlash className="text-mono-400 size-4.5 stroke-[1.3px]" />
            <span className="text-mono-400 text-[15px]">Quick Search</span>
          </CmdKTrigger>

          <Link
            href="/docs/contributing"
            className="text-mono-700 border-mono-200 ml-2 cursor-pointer rounded-md border p-1.25 transition-colors"
          >
            <GitPullRequestCreateArrow className="size-4.5" />
          </Link>
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
          <div className="hidden items-center gap-4 sm:flex">
            <div className="bg-mono-300 h-4 w-px" />
            <ThemeSelection />
          </div>
        </div>
      </nav>
    </header>
  );
}
