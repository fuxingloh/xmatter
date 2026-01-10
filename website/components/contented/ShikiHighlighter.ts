import { getHighlighter, Highlighter, Lang, renderToHtml } from "shiki";
import JsonGrammar from "shiki/languages/json.tmLanguage.json";
import CssVariablesTheme from "shiki/themes/css-variables.json";

let highlighter: Highlighter;

/**
 * Server-side renders a code block with CSS variables
 */
export async function renderHighlighterHtml(props: { code: string; language: Lang }): Promise<string> {
  if (highlighter === undefined) {
    highlighter = await getHighlighter({
      theme: CssVariablesTheme as any,
      langs: [
        {
          id: "json",
          scopeName: "source.json",
          path: "-",
          grammar: JsonGrammar as any,
        },
      ],
    });
  }

  const tokens = highlighter.codeToThemedTokens(props.code, props.language);
  return renderToHtml(tokens, {
    fg: highlighter.getForegroundColor(),
    bg: highlighter.getBackgroundColor(),
    elements: {
      pre({ className, style, children }) {
        return `<pre class="${className} css-variable" style="${style}">${children}</pre>`;
      },
    },
  });
}
