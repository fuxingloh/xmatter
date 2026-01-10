"use client";
import { ReactElement, ReactNode, useEffect } from "react";

/**
 * Use <BodyLock> instead of this hook to avoid unnecessary client-side rendering.
 */
export function useBodyLock(shouldLock: boolean = true): void {
  useEffect(() => {
    if (shouldLock) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [shouldLock]);
}

/**
 * Include this component in your page to lock the body scroll,
 * and unlock it when the component is unmounted.
 *
 * ```tsx
 * <div>
 *   <BodyLock/>
 *   <p>Actual Content</p>
 * </div>
 * ```
 */
export function BodyLock(props: { children?: ReactNode; shouldLock?: boolean }): ReactElement {
  useBodyLock(props.shouldLock);

  return <>{props.children}</>;
}
