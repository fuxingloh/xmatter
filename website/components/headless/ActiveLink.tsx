"use client";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactElement, ReactNode } from "react";

/**
 * ActiveLink is a wrapper around Next.js Link that adds an `activeClassName` prop.
 * This prop is used to add a class to the link when the current path matches the link's href.
 * This is useful for styling active links.
 *
 * Only use this component if you absolutely need to style active links.
 * Because this component uses `usePathname`, it will cause the link to be rendered on client-side only
 * effectively hurting SEO & Performance.
 */
export function ActiveLink(
  props: Omit<ComponentProps<typeof Link>, "href"> & {
    children: ReactNode;
    activeClassName: string;
    href: string;
    mode?: "prefix" | "exact";
  },
): ReactElement {
  const pathname = usePathname();
  const { children, className, mode, activeClassName, ...rest } = props;
  const isActive = mode === "prefix" ? pathname.startsWith(props.href) : pathname === props.href;

  return (
    <Link {...rest} className={clsx(className, { [activeClassName]: isActive })}>
      {children}
    </Link>
  );
}
