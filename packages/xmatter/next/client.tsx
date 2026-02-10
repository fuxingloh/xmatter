"use client";

import Image, { type ImageProps } from "next/image";
import { type ReactNode, useState } from "react";

export type XmatterIconProps = {
  namespace: string;
  chainId: string;
  address: string;
  fallback: ReactNode;
  baseUrl?: string;
} & Omit<ImageProps, "src" | "onError">;

export type IconWithFallbackProps = {
  fallback: ReactNode;
} & Omit<ImageProps, "onError">;

export function IconWithFallback({ fallback, ...props }: IconWithFallbackProps): ReactNode {
  const [error, setError] = useState(false);

  if (error) {
    return fallback;
  }

  return <Image onError={() => setError(true)} {...props} />;
}

export function XmatterIcon({
  namespace,
  chainId,
  address,
  fallback,
  baseUrl = "https://xmatter.org",
  ...props
}: XmatterIconProps): ReactNode {
  return (
    <IconWithFallback src={`${baseUrl}/${namespace}/${chainId}/${address}/icon.webp`} fallback={fallback} {...props} />
  );
}
