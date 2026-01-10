import { clsx } from "clsx";
import { Parser, ProcessNodeDefinitions } from "html-to-react";
import Link from "next/link";
import { ReactElement } from "react";

const HtmlToReactParser = Parser();
const processNodeDefinitions = ProcessNodeDefinitions();
const processingInstructions = [
  {
    replaceChildren: false,
    shouldProcessNode: (node: any) => node.name === "a",
    processNode: (node: any, children: ReactElement) => {
      const { href, target, ...props } = node.attribs;
      return (
        <Link href={href} target={target} {...props}>
          {children}
        </Link>
      );
    },
  },
  {
    shouldProcessNode: () => true,
    processNode: processNodeDefinitions.processDefaultNode,
  },
];

export function ContentedProse(props: { className?: string; html: string }): ReactElement {
  const parsed = HtmlToReactParser.parseWithInstructions(props.html, () => true, processingInstructions);

  return (
    <article id="contented-prose" className={clsx(props.className, "dark:prose-invert prose")}>
      {parsed}
    </article>
  );
}
