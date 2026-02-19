// @ts-expect-error -- moduleResolution:node can't resolve package exports
import { createHighlighter } from "shiki/bundle/web";

interface SourceFile {
  name: string;
  path: string;
  content: string;
}

interface SourcifyMatch {
  chainId: string;
  address: string;
  status: string;
}

interface SourcifyContract {
  matches: SourcifyMatch[];
  files: Array<{
    name: string;
    path: string;
    content: string;
  }>;
}

async function fetchSourcifyContract(chainId: string, address: string): Promise<{ files: SourceFile[] } | null> {
  try {
    const response = await fetch(`https://sourcify.dev/server/files/${chainId}/${address}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as SourcifyContract;

    // Filter to only show Solidity source files, excluding metadata and other files
    const sourceFiles = data.files
      .filter((file) => file.name.endsWith(".sol"))
      .map((file) => ({
        name: file.name,
        path: file.path,
        content: file.content,
      }));

    return { files: sourceFiles };
  } catch (error) {
    console.error("Error fetching Sourcify contract:", error);
    return null;
  }
}

export default async function SourceCode(props: { chainId: string; address: string }) {
  const contract = await fetchSourcifyContract(props.chainId, props.address);

  if (!contract || contract.files.length === 0) {
    return null;
  }

  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["solidity"],
  });

  const highlightedFiles = contract.files.map((file) => ({
    name: file.name,
    path: file.path,
    html: highlighter.codeToHtml(file.content, {
      lang: "solidity",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      defaultColor: false,
    }),
  }));

  highlighter.dispose();

  return (
    <div className="border-mono-200 border-t pt-8">
      <h4 className="text-mono-500 mb-2 text-sm">SOURCE CODE</h4>
      <p className="text-mono-600 mb-4 text-sm">
        Verified source code from{" "}
        <a
          href={`https://sourcify.dev/#/lookup/${props.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          sourcify.dev
        </a>
      </p>
      <div className="flex flex-col gap-6">
        {highlightedFiles.map((file) => (
          <div key={file.path} className="border-mono-200 rounded-md border">
            <h5 className="border-mono-200 bg-mono-50 text-mono-700 border-b px-4 py-2 font-mono text-sm font-semibold">
              {file.name}
            </h5>
            <div
              className="overflow-x-auto [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!border-0 [&_pre]:p-4 [&_pre]:text-sm"
              dangerouslySetInnerHTML={{ __html: file.html }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
