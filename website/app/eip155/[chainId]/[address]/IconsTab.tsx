"use client";
import Image from "next/image";
import { useState } from "react";
import { cx } from "@/components/cx";

export function IconsTab(props: { chainId: string; address: string; icons: string[] }) {
  const [icon, setIcon] = useState(props.icons[0]);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <h4 className="text-mono-500 text-sm">ICONS</h4>
        <div className="border-mono-200 bg-mono-50 flex items-center gap-0.5 rounded-md border p-0.5">
          {props.icons.map((thisIcon) => (
            <button
              onClick={() => setIcon(thisIcon)}
              key={thisIcon}
              className={cx(
                "hover:bg-mono-200/50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-0.5 transition-colors",
                {
                  "bg-mono-200/60": thisIcon === icon,
                },
              )}
            >
              {thisIcon}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg">
        <div className="bg-mono-100 text-mono-950 flex items-end justify-center gap-4 p-6">
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={16} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={32} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={48} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={64} />
        </div>
        <div className="bg-mono-950 text-mono-100 flex items-end justify-center gap-4 p-6">
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={16} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={32} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={48} />
          <IconImage chainId={props.chainId} address={props.address} icon={icon} size={64} />
        </div>
      </div>
    </div>
  );
}

function IconImage(props: { chainId: string; address: string; icon: string; size: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src={`/eip155/${props.chainId}/${props.address}/${props.icon}`}
        alt={`${props.address} icon`}
        width={64}
        height={64}
        style={{ width: props.size, height: props.size }}
      />
      <h6 className="text-sm">
        {props.size}x{props.size}
      </h6>
    </div>
  );
}
