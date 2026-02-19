"use client";

import { useState } from "react";
import { cx } from "@/components/cx";

export type SourcifyFile = { path: string; html: string };

export function SourcifySourceClient(props: {
  files: SourcifyFile[];
  language: string;
  compilerVersion: string;
  contractName: string;
  match: string;
}) {
  const [selected, setSelected] = useState(0);
  const file = props.files[selected];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-mono-500">Contract</span>
          <span className="font-medium">{props.contractName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-mono-500">Language</span>
          <span className="font-medium">{props.language}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-mono-500">Compiler</span>
          <span className="font-medium">{props.compilerVersion}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-mono-500">Match</span>
          <span className="font-medium">{props.match === "exact_match" ? "Exact" : "Partial"}</span>
        </div>
      </div>

      {props.files.length > 1 && (
        <div className="border-mono-200 bg-mono-50 mb-3 flex flex-wrap items-center gap-0.5 rounded-md border p-0.5">
          {props.files.map((f, i) => (
            <button
              onClick={() => setSelected(i)}
              key={f.path}
              className={cx(
                "hover:bg-mono-200/50 text-mono-500 hover:text-mono-950 cursor-pointer rounded-[5px] px-2 py-0.5 font-mono text-xs transition-colors",
                {
                  "bg-mono-200/66 text-mono-950": i === selected,
                },
              )}
            >
              {getFilename(f.path)}
            </button>
          ))}
        </div>
      )}

      {file && (
        <div className="border-mono-200 overflow-hidden rounded-lg border">
          <div className="border-mono-200 bg-mono-100/75 flex items-center border-b px-3 py-2.5">
            <span className="text-mono-500 font-mono text-xs">{file.path}</span>
          </div>
          <div
            className="[&_pre]:bg-mono-50 max-h-[600px] overflow-auto text-sm [&_pre]:overflow-x-auto [&_pre]:p-4"
            dangerouslySetInnerHTML={{ __html: file.html }}
          />
        </div>
      )}
    </div>
  );
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}
