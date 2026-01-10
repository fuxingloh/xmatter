"use client";
import { ReactElement, ReactNode, useEffect } from "react";

export function ThemeScript(): ReactElement {
  // To prevent FOUC, we use <script> as well as `useEffect()`
  // Although 'use client' is used, this will be included in the server-side rendered when we place it in <head>
  const html: string = `document.documentElement.dataset.theme = localStorage.theme || 'system';`;
  return <script dangerouslySetInnerHTML={{ __html: html }} />;
}

function useSetTheme(): (theme: "system" | "light" | "dark") => void {
  const updateDocumentElement = (): void => {
    document.documentElement.classList.add("[&_*]:!transition-none");
    window.setTimeout((): void => {
      document.documentElement.classList.remove("[&_*]:!transition-none");
    });

    document.documentElement.dataset.theme = localStorage.theme || "system";
  };

  useEffect(() => {
    updateDocumentElement();
  }, []);

  return (theme: "system" | "light" | "dark"): void => {
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else if (theme === "light") {
      localStorage.theme = "light";
    } else if (theme === "dark") {
      localStorage.theme = "dark";
    }
    updateDocumentElement();
  };
}
