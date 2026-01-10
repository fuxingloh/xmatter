"use client";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import Square2StackIcon from "@heroicons/react/24/outline/Square2StackIcon";
import { ButtonHTMLAttributes, DetailedHTMLProps, ReactElement, useState } from "react";

export function ClipboardButton(
  props: Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "onClick" | "type"> & {
    content: string;
    notification?: boolean;
  },
): ReactElement {
  const [state, setState] = useState<string>();
  return (
    <button
      {...props}
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(props.content);
        setState("selected");

        setTimeout(() => {
          setState(undefined);
        }, 3000);
      }}
    >
      {props.children ?? <>{state === "selected" ? <CheckCircleIcon /> : <Square2StackIcon />}</>}
    </button>
  );
}
