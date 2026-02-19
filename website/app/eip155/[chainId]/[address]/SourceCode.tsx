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
    // Normalize address to checksum format
    const checksumAddress = address.toLowerCase();

    const response = await fetch(`https://sourcify.dev/server/files/${chainId}/${checksumAddress}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Silently fail for non-200 responses (contract not verified, API down, etc.)
      return null;
    }

    const data = (await response.json()) as SourcifyContract;

    // Validate the response structure
    if (!data || !Array.isArray(data.files)) {
      console.warn("Invalid Sourcify API response structure");
      return null;
    }

    // Filter to only show Solidity source files, excluding metadata and other files
    const sourceFiles = data.files
      .filter((file) => file && file.name && file.name.endsWith(".sol") && file.content)
      .map((file) => ({
        name: file.name,
        path: file.path || "",
        content: file.content,
      }));

    return sourceFiles.length > 0 ? { files: sourceFiles } : null;
  } catch {
    // Silently fail - contract likely not verified or API unavailable
    return null;
  }
}

export default async function SourceCode(props: { chainId: string; address: string }) {
  const contract = await fetchSourcifyContract(props.chainId, props.address);

  if (!contract || contract.files.length === 0) {
    return null;
  }

  let highlightedFiles: Array<{ name: string; path: string; html: string }>;

  try {
    const highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["solidity"],
    });

    highlightedFiles = contract.files.map((file) => ({
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
  } catch {
    // If syntax highlighting fails, silently fail and don't render anything
    return null;
  }

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
