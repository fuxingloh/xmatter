"use client";

import Image, { type ImageProps } from "next/image";
import { type ReactNode, useState } from "react";

export type XmatterIconProps = {
  chainId: string;
  address: string;
  fallback: ReactNode;
  baseUrl?: string;
} & Omit<ImageProps, "src" | "onError">;

export function XmatterIcon({
  chainId,
  address,
  fallback,
  baseUrl = "https://xmatter.org",
  ...props
}: XmatterIconProps): ReactNode {
  const [error, setError] = useState(false);

  if (error) {
    return fallback;
  }

  return <Image src={`${baseUrl}/eip155/${chainId}/${address}/icon`} onError={() => setError(true)} {...props} />;
}
