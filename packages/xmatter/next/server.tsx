import type { ReactNode } from "react";

import type { Eip155Client } from "../client.js";
import { IconWithFallback, type IconWithFallbackProps } from "./client.js";

export type XmatterIconProps = {
  client: Eip155Client;
  chainId: string;
  address: string;
} & Omit<IconWithFallbackProps, "src">;

export async function XmatterIcon({
  client,
  chainId,
  address,
  fallback,
  ...props
}: XmatterIconProps): Promise<ReactNode> {
  const url = await client.getIconUrl(chainId, address);
  if (!url) {
    return fallback;
  }

  return <IconWithFallback src={url.toString()} fallback={fallback} {...props} />;
}
