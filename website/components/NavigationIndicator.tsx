"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { ReactElement, Suspense, useCallback, useEffect, useState } from "react";

export function NavigationIndicator(): ReactElement {
  return (
    <Suspense>
      <ClientNavigationIndicator />
    </Suspense>
  );
}

function ClientNavigationIndicator(): ReactElement {
  const duration: number = 0.5;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [width, setWidth] = useState(15);

  /**
   * See https://nextjs.org/docs/app/api-reference/functions/use-router#router-events
   * This is a stop-gap solution until Next.js supports a way to listen to all link clicks.
   */
  const onClickLink = useCallback((event: any) => {
    // Ignore when new tab
    if (event.metaKey || event.ctrlKey) return;

    const anchor = event.target.closest("a");
    if (!anchor) return;
    // Ignore when _blank
    if (anchor.target === "_blank") return;
    // Ignore when anchor navigation
    if (isAnchor(anchor)) return;

    setShow(true);
  }, []);

  useEffect(() => {
    setShow(false);
    setWidth(20);

    document.addEventListener("click", onClickLink);
    return () => document.removeEventListener("click", onClickLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!show) return;

    const intervalId = setInterval(() => {
      setWidth((prev) => {
        return prev >= 90 ? 90 : prev + 1;
      });
    }, duration * 1000);

    return () => clearInterval(intervalId);
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="bg-mono-200 fixed top-0 right-0 left-0 z-50 w-full"
            initial={{ width: "0%", opacity: 0, height: 0 }}
            animate={{ width: `${width}%`, opacity: 1, height: 3 }}
            exit={{ width: "300%", opacity: 0 }}
            transition={{ duration: duration, ease: "linear" }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration, ease: "linear" }}
          >
            <svg
              className="fixed top-2 right-3 z-50 h-5 w-5 animate-[spin_500ms_linear_infinite]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="text-invert/20 stroke-current" cx="12" cy="12" r="10" strokeWidth="4" />
              <path
                className="text-mono-500 fill-current"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function isAnchor(anchor: HTMLAnchorElement): boolean {
  const currentURL = new URL(window.location.href);
  const clickedURL = new URL(anchor.href);

  if (
    currentURL.pathname === clickedURL.pathname &&
    currentURL.hash === clickedURL.hash &&
    currentURL.origin === clickedURL.origin
  ) {
    return true;
  }

  if (
    currentURL.hostname === clickedURL.hostname &&
    currentURL.pathname === clickedURL.pathname &&
    currentURL.search === clickedURL.search
  ) {
    return currentURL.href.replace(currentURL.hash, "") === clickedURL.href.replace(clickedURL.hash, "");
  }
  return false;
}
