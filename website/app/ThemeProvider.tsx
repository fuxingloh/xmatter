"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { cx } from "@/components/cx";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider enableSystem={true} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export function ThemeSelection() {
  const [isClient, setIsClient] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, [theme, setTheme]);

  if (!isClient) {
    return (
      <div className="bg-muted border-mono-200 flex animate-pulse items-center rounded-full border">
        <div className="size-6.5 rounded-full" />
        <div className="size-6.5 rounded-full" />
        <div className="size-6.5 rounded-full" />
      </div>
    );
  }

  return (
    <div className="border-mono-200 flex items-center rounded-full border">
      <button
        onClick={() => setTheme("system")}
        className={cx(
          "text-mono-700 cursor-pointer rounded-full p-1.5 transition-colors",
          theme === "system" && "bg-mono-200/60 text-mono-950",
        )}
      >
        <Monitor className="mx-auto size-3.5" />
        <span className="sr-only">System</span>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={cx(
          "text-mono-700 cursor-pointer rounded-full p-1.5 transition-colors",
          theme === "light" && "bg-mono-200/60 text-mono-950",
        )}
      >
        <Sun className="mx-auto size-3.5" />
        <span className="sr-only">Light</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cx(
          "text-mono-700 cursor-pointer rounded-full p-1.5 transition-colors",
          theme === "dark" && "bg-mono-200/60 text-mono-950",
        )}
      >
        <Moon className="mx-auto size-3.5" />
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}
