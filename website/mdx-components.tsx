import { useMDXComponents as getNextraComponents } from "nextra/mdx-components";
import type { MDXComponents } from "mdx/types";

const nextraComponents = getNextraComponents();

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...nextraComponents,
    ...components,
  };
}
