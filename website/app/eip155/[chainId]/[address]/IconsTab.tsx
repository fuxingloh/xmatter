"use client";
import Image from "next/image";
import { useState } from "react";
import { cx } from "@/components/cx";

export function IconsTab(props: { chainId: string; address: string; icons: string[] }) {
  const [icon, setIcon] = useState(props.icons[0]);

  return (
    <div>
      <div className="mb-4 flex items-end gap-2">
        <div className="border-mono-200 bg-mono-50 flex items-center gap-0.5 rounded-md border p-0.5">
          {props.icons.map((thisIcon) => (
            <button
              onClick={() => setIcon(thisIcon)}
              key={thisIcon}
              className={cx(
                "hover:bg-mono-200/50 text-mono-500 hover:text-mono-950 flex cursor-pointer items-center gap-1.25 rounded-[5px] px-2 py-0.5 transition-colors",
                {
                  "bg-mono-200/66 text-mono-950": thisIcon === icon,
                },
              )}
            >
              <IconAcronym icon={thisIcon} />
              {thisIcon}
            </button>
          ))}
        </div>
      </div>
      <div className="grid overflow-hidden rounded-lg sm:grid-cols-2">
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

function IconAcronym(props: { icon: string }) {
  if (props.icon.endsWith(".svg")) {
    return (
      <svg height="16" viewBox="0 0 20 16" width="16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          d="M2.5 2.25H17.5C18.1904 2.25 18.75 2.80964 18.75 3.5V12.5C18.75 13.1904 18.1904 13.75 17.5 13.75H2.5C1.80964 13.75 1.25 13.1904 1.25 12.5V3.5C1.25 2.80964 1.80964 2.25 2.5 2.25ZM0 3.5C0 2.11929 1.11929 1 2.5 1H17.5C18.8807 1 20 2.11929 20 3.5V12.5C20 13.8807 18.8807 15 17.5 15H2.5C1.11929 15 0 13.8807 0 12.5V3.5ZM4.25 6.875C4.25 6.66789 4.41789 6.5 4.625 6.5H6V5H4.625C3.58947 5 2.75 5.83947 2.75 6.875C2.75 7.91053 3.58947 8.75 4.625 8.75C4.83211 8.75 5 8.91789 5 9.125C5 9.33211 4.83211 9.5 4.625 9.5H3V11H4.625C5.66053 11 6.5 10.1605 6.5 9.125C6.5 8.08947 5.66053 7.25 4.625 7.25C4.41789 7.25 4.25 7.08211 4.25 6.875ZM9 5V8.58579C9 8.65209 9.02634 8.71568 9.07322 8.76256L9.5 9.18934L9.92678 8.76256C9.97366 8.71568 10 8.65209 10 8.58579V5H11.5V8.58579C11.5 9.04992 11.3156 9.49504 10.9874 9.82322L10.0303 10.7803L9.5 11.3107L8.96967 10.7803L8.01256 9.82322C7.68437 9.49503 7.5 9.04992 7.5 8.58579V5H9ZM14.75 5C13.5074 5 12.5 6.00736 12.5 7.25V8.75C12.5 9.99264 13.5074 11 14.75 11H16C16.6904 11 17.25 10.4404 17.25 9.75V9.25C17.25 8.55964 16.6904 8 16 8H15.25V9.5H14.75C14.3358 9.5 14 9.16421 14 8.75V7.25C14 6.83579 14.3358 6.5 14.75 6.5H15.25C15.5261 6.5 15.75 6.72386 15.75 7H17.25C17.25 5.89543 16.3546 5 15.25 5H14.75Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (props.icon.endsWith(".jpg") || props.icon.endsWith(".jpeg")) {
    return (
      <svg height="16" viewBox="0 0 20 16" width="16">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          d="M2.5 2.25H17.5C18.1904 2.25 18.75 2.80964 18.75 3.5V12.5C18.75 13.1904 18.1904 13.75 17.5 13.75H2.5C1.80964 13.75 1.25 13.1904 1.25 12.5V3.5C1.25 2.80964 1.80964 2.25 2.5 2.25ZM0 3.5C0 2.11929 1.11929 1 2.5 1H17.5C18.8807 1 20 2.11929 20 3.5V12.5C20 13.8807 18.8807 15 17.5 15H2.5C1.11929 15 0 13.8807 0 12.5V3.5ZM5 9.125V5H6.5V9.125C6.5 10.1605 5.66053 11 4.625 11C3.58947 11 2.75 10.1605 2.75 9.125V8.75H4.25V9.125C4.25 9.33211 4.41789 9.5 4.625 9.5C4.83211 9.5 5 9.33211 5 9.125ZM9.25 9V11H7.75V9V8.25V5.75V5H8.5H9.25H10C10.9665 5 11.75 5.7835 11.75 6.75V7.25C11.75 8.2165 10.9665 9 10 9H9.25ZM9.25 7.5H10C10.1381 7.5 10.25 7.38807 10.25 7.25V6.75C10.25 6.61193 10.1381 6.5 10 6.5H9.25V7.5ZM14.75 5C13.5074 5 12.5 6.00736 12.5 7.25V8.75C12.5 9.99264 13.5074 11 14.75 11H16C16.6904 11 17.25 10.4404 17.25 9.75V9.25C17.25 8.55964 16.6904 8 16 8H15.25V9.5H14.75C14.3358 9.5 14 9.16421 14 8.75V7.25C14 6.83579 14.3358 6.5 14.75 6.5H15.25C15.5261 6.5 15.75 6.72386 15.75 7H17.25C17.25 5.89543 16.3546 5 15.25 5H14.75Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return null;
}
