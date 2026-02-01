import type { ReactNode } from "react";

import type { Eip155Address, Eip155Client } from "../client.js";
import { Eip155Icon as ClientEip155Icon, type Eip155IconProps } from "./client.js";

export type ServerEip155IconProps = {
  client: Eip155Client;
} & Eip155IconProps;

export async function Eip155Icon({
  client,
  chainId,
  address,
  fallback,
  ...props
}: ServerEip155IconProps): Promise<ReactNode> {
  const exists = await client.has(chainId, address as Eip155Address);
  if (!exists) {
    return fallback;
  }

  return <ClientEip155Icon chainId={chainId} address={address} fallback={fallback} {...props} />;
}
