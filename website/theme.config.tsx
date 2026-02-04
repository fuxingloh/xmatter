import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { Xmatter } from "@/components/icons/Xmatter";

const config: DocsThemeConfig = {
  logo: (
    <div className="flex items-center gap-1.5">
      <Xmatter className="size-4.5" />
      <span className="text-lg font-bold">Xmatter</span>
    </div>
  ),
  project: {
    link: "https://github.com/fuxingloh/xmatter",
  },
  docsRepositoryBase: "https://github.com/fuxingloh/xmatter/tree/main/website",
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{" "}
        <a href="https://xmatter.org" target="_blank" rel="noopener noreferrer">
          Xmatter
        </a>
        .
      </span>
    ),
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Xmatter" />
      <meta property="og:description" content="Structured metadata for smart contracts, the frontpage of an address." />
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Xmatter",
    };
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
};

export default config;
