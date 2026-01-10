import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import { ReactElement } from "react";

dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export { dayjs };

export function DayJsFormat(props: {
  children?: dayjs.ConfigType;
  template?: string;
  className?: string;
}): ReactElement {
  return (
    <span className={props.className}>{dayjs(props.children).format(props.template ?? "MMM D, YYYY hh:mm A")}</span>
  );
}

export function DayJsFromNow(props: {
  children?: dayjs.ConfigType;
  className?: string;
  withoutSuffix?: boolean;
}): ReactElement {
  return <span className={props.className}>{dayjs(props.children).fromNow(props.withoutSuffix ?? false)}</span>;
}

export function DayJsFrom(props: {
  children?: dayjs.ConfigType;
  compared: dayjs.ConfigType;
  className?: string;
  withoutSuffix?: boolean;
}): ReactElement {
  return (
    <span className={props.className}>{dayjs(props.children).from(props.compared, props.withoutSuffix ?? false)}</span>
  );
}

export function DayJsToNow(props: {
  children?: dayjs.ConfigType;
  className?: string;
  withoutSuffix?: boolean;
}): ReactElement {
  return <span className={props.className}>{dayjs(props.children).toNow(props.withoutSuffix ?? false)}</span>;
}

export function DayJsTo(props: {
  children?: dayjs.ConfigType;
  compared: dayjs.ConfigType;
  className?: string;
  withoutSuffix?: boolean;
}): ReactElement {
  return (
    <span className={props.className}>{dayjs(props.children).to(props.compared, props.withoutSuffix ?? false)}</span>
  );
}
