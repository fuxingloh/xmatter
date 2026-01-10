"use client";
import ComputerDesktopIcon from "@heroicons/react/24/solid/ComputerDesktopIcon";
import MoonIcon from "@heroicons/react/24/solid/MoonIcon";
import SunIcon from "@heroicons/react/24/solid/SunIcon";
import clsx from "clsx";
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

/**
 * Toggle between light, dark, and system theme
 */
export function ThemeToggle(props: { className?: string; children?: ReactNode }): ReactElement {
  const setTheme = useSetTheme();

  function ThemeButton(props: {
    theme: string;
    className?: string;
    onClick: () => void;
    children: ReactNode;
  }): ReactElement {
    return (
      <div
        className={clsx(
          `hidden [[data-theme=${props.theme}]_&]:block`,
          props.className ?? "h-7 w-7 rounded p-1.5 text-mono-300 transition hover:bg-invert/5 [&_>]:fill-current",
        )}
        onClick={props.onClick}
      >
        {props.children}
      </div>
    );
  }

  return (
    <button>
      <ThemeButton theme="light" className={props.className} onClick={() => setTheme("system")}>
        <SunIcon />
        {props.children}
      </ThemeButton>
      <ThemeButton theme="system" className={props.className} onClick={() => setTheme("dark")}>
        <ComputerDesktopIcon />
        {props.children}
      </ThemeButton>
      <ThemeButton theme="dark" className={props.className} onClick={() => setTheme("light")}>
        <MoonIcon />
        {props.children}
      </ThemeButton>
    </button>
  );
}

/**
 * Show the icon of the current theme
 */
export function ThemeIcon(props: { className?: string }): ReactElement {
  return (
    <>
      <MoonIcon className={clsx("hidden fill-current [[data-theme=dark]_&]:block", props.className)} />
      <SunIcon className={clsx("hidden fill-current [[data-theme=light]_&]:block", props.className)} />
      <ComputerDesktopIcon className={clsx("hidden fill-current [[data-theme=system]_&]:block", props.className)} />
    </>
  );
}

export function ThemeSelector(): ReactElement {
  const setTheme = useSetTheme();

  function ThemeButton(props: { className?: string; onClick: () => void; children: ReactNode }): ReactElement {
    return (
      <button
        type="button"
        className={clsx(
          "h-7 w-7 rounded p-1.5 text-mono-300 transition hover:bg-invert/5 [&_>]:fill-current",
          props.className,
        )}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    );
  }

  return (
    <div className="flex gap-0.5">
      <ThemeButton onClick={() => setTheme("light")} className="[[data-theme=light]_&]:bg-invert/5">
        <SunIcon />
      </ThemeButton>
      <ThemeButton onClick={() => setTheme("system")} className="[[data-theme=system]_&]:bg-invert/5">
        <ComputerDesktopIcon />
      </ThemeButton>
      <ThemeButton onClick={() => setTheme("dark")} className="[[data-theme=dark]_&]:bg-invert/5">
        <MoonIcon />
      </ThemeButton>
    </div>
  );
}
