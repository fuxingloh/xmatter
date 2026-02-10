import type { ReactNode } from "react";

import type { XmatterClient } from "../client.js";
import { IconWithFallback, type IconWithFallbackProps } from "./client.js";

export type XmatterIconProps = {
  client: XmatterClient;
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
  const url = await client.getIconWebpUrl(chainId, address);
  if (!url) {
    return fallback;
  }

  return <IconWithFallback src={url.toString()} fallback={fallback} {...props} />;
}
