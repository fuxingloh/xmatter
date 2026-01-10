import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

import { ActiveLink } from '@/components/headless/ActiveLink';
import { NavigationIndicator } from '@/components/NavigationIndicator';
import { ThemeScript } from '@/components/Theme';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL!),
  title: {
    template: `%s – xMatter`,
    default: `xMatter`,
  },
  description: 'xMatter is a collection of frontmatter for crypto projects.',
};

export default function RootLayout(props: { children: ReactNode }): ReactElement {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body className="text-mono-300 mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8 xl:px-10">
        <NavigationIndicator />
        <header className="flex items-center justify-between py-6">
          <ActiveLink
            href="/"
            mode="exact"
            className="hover:bg-invert/5 -mx-3 -my-1 rounded px-3 py-1"
            activeClassName="!cursor-default hover:!bg-transparent"
          >
            <div className="text-mono-200 text-lg font-bold">Crypto Frontmatter</div>
          </ActiveLink>
        </header>
        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
