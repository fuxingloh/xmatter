import type { ReactNode } from "react";

import type { Eip155Client } from "../client.js";
import { XmatterIcon as ClientXmatterIcon, type XmatterIconProps as ClientXmatterIconProps } from "./client.js";

export type XmatterIconProps = {
  client: Eip155Client;
} & ClientXmatterIconProps;

export async function XmatterIcon({
  client,
  chainId,
  address,
  fallback,
  ...props
}: XmatterIconProps): Promise<ReactNode> {
  const exists = await client.has(chainId, address);
  if (!exists) {
    return fallback;
  }

  return <ClientXmatterIcon chainId={chainId} address={address} fallback={fallback} {...props} />;
}
