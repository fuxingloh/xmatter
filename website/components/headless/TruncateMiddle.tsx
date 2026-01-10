import { clsx } from "clsx";
import { ReactElement } from "react";

export function TruncateMiddle(props: {
  children: string;
  className?: string;
  prefixLength?: number;
  suffixLength?: number;
}): ReactElement {
  const text = props.children;
  return (
    <div className={clsx("relative inline-block select-none break-keep", props.className)}>
      {text.substring(0, props.prefixLength ?? 6)}…{text.substring(text.length - (props.suffixLength ?? 6))}
      <div className="absolute inset-0 select-all overflow-clip whitespace-nowrap text-transparent">{text}</div>
    </div>
  );
}
