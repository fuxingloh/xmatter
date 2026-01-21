import { z } from "zod";

export const FrontmatterSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^(?!\s)(?!.*\s$).*$/)
    .describe("Name of the token"),
  provenance: z.string().describe("Where did this entry come from?"),
  standards: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  links: z
    .array(
      z.object({
        name: z.string(),
        url: z.url(),
      }),
    )
    .optional(),
  symbol: z
    .string()
    .min(1)
    .regex(/^(?!\s)(?!.*\s$).*$/)
    .optional(),
  decimals: z.number().int().min(0).max(256).optional(),
  icon: z.string().optional().describe("Primary icon for this entry."),
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional()
    .describe("Primary color for this entry based on its icon."),
});

export const XmatterSchema = z.object({
  data: FrontmatterSchema,
  content: z.string().optional(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type XmatterFile = z.infer<typeof XmatterSchema>;
