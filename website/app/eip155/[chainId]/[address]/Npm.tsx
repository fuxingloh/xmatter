import { cx } from "@/components/cx";
// import { createHighlighter } from "shiki";

export default function Npm() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-mono-950 bg-mono-200/50 flex items-center gap-1.5 rounded-sm px-2 py-1.25 font-mono text-sm select-all">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
            />
          </svg>
          <span>npm add xmatter</span>
        </h4>

        <div className="border-mono-200 bg-mono-50 flex items-center gap-0.5 rounded-md border p-0.5">
          {["next/server", "next/client"].map((thisExample) => (
            <button
              // onClick={() => setSelected(thisExample)}
              key={thisExample}
              className={cx(
                "hover:bg-mono-200/50 text-mono-500 hover:text-mono-950 flex cursor-pointer items-center gap-1.25 rounded-[5px] px-2 py-0.5 transition-colors",
                {
                  // "bg-mono-200/66 text-mono-950": thisExample === selected,
                },
              )}
            >
              {thisExample}
            </button>
          ))}
        </div>
      </div>

      <div>{/*<NextServer />*/}</div>
    </div>
  );
}

// function NextServer() {
//   return (
//     <CodeBlock>
//       {[
//         "console.log(\"Hello\")",
//         "console.log(\"World\")",
//       ].join("\n")}
//     </CodeBlock>
//   );
// }
//
// async function CodeBlock(props: {
//   children: string
// }) {
//   const highlighter = await createHighlighter({
//     themes: ["github-dark", "github-light"],
//     langs: ["typescript"],
//   });
//
//   const out = highlighter.codeToHtml(props.children, {
//     lang: "typescript",
//     theme: "github-dark",
//   });
//
//   return <div dangerouslySetInnerHTML={{ __html: out }} />;
// }
