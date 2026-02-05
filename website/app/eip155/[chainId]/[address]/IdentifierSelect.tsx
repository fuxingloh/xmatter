"use client";

import { useState } from "react";
import { Select } from "@base-ui/react/select";
import { ChevronDown, Copy, CopyCheck } from "lucide-react";

const identifierTypes = ["Xmatter Path", "CAIP-10", "CAIP-19 (ERC20)"] as const;
type IdentifierType = (typeof identifierTypes)[number];

function getIdentifierValue(type: IdentifierType, chainId: string, address: string): string {
  switch (type) {
    case "Xmatter Path":
      return `/eip155/${chainId}/${address}`;
    case "CAIP-10":
      return `eip155:${chainId}:${address}`;
    case "CAIP-19 (ERC20)":
      return `eip155:${chainId}/erc20:${address}`;
  }
}

export function IdentifierSelect(props: { chainId: string; address: string }) {
  const [selected, setSelected] = useState<IdentifierType>("Xmatter Path");
  const [copied, setCopied] = useState(false);

  const value = getIdentifierValue(selected, props.chainId, props.address);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h4 className="text-mono-500 mb-2 text-sm">IDENTIFIER</h4>
      <div className="flex flex-wrap items-stretch gap-2">
        <Select.Root
          value={selected}
          onValueChange={(val) => {
            if (val) setSelected(val as IdentifierType);
          }}
        >
          <Select.Trigger className="border-mono-200 bg-mono-50 hover:bg-mono-100 flex shrink-0 cursor-pointer items-center gap-0.75 rounded-md border py-1.25 pr-1.25 pl-2 text-sm transition-colors">
            <Select.Value />
            <Select.Icon>
              <ChevronDown className="size-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup className="bg-mono-50 border-mono-200 rounded-md border shadow-lg">
                {identifierTypes.map((type) => (
                  <Select.Item
                    key={type}
                    value={type}
                    className="text-mono-700 hover:bg-mono-100 data-highlighted:bg-mono-100 cursor-pointer px-3 py-1.5 text-sm"
                  >
                    <Select.ItemText>{type}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <div className="text-mono-800 border-mono-200 flex items-center gap-1.5 rounded-md border py-2 pr-2 pl-2.5">
          <div className="font-mono text-sm leading-tight break-all">{value}</div>
          <button
            onClick={handleCopy}
            className="text-mono-400 hover:text-mono-700 shrink-0 cursor-pointer transition-colors"
          >
            {copied ? <CopyCheck className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
