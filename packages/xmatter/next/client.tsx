"use client";

import Image, { type ImageProps } from "next/image";
import { type ReactNode, useState } from "react";

export type Eip155IconProps = {
  chainId: string;
  address: string;
  fallback: ReactNode;
  alt: string;
  width: number;
  height: number;
  baseUrl?: string;
} & Omit<ImageProps, "src" | "alt" | "width" | "height" | "onError">;

export function Eip155Icon({
  chainId,
  address,
  fallback,
  alt,
  width,
  height,
  baseUrl = "https://xmatter.org",
  ...props
}: Eip155IconProps): ReactNode {
  const [error, setError] = useState(false);

  if (error) {
    return fallback;
  }

  return (
    <Image
      src={`${baseUrl}/eip155/${chainId}/${address}/icon`}
      alt={alt}
      width={width}
      height={height}
      onError={() => setError(true)}
      {...props}
    />
  );
}
