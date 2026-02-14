import { z } from "zod";

export const FrontmatterSchema = z.object({
  name: z
    .string()
    .nonempty()
    .max(100)
    .transform((value) => value.trim())
    .describe("Name of the token"),
  provenance: z.url().describe("Where did this entry come from?"),
  description: z.string().optional(),
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
  icons: z.array(z.string()).describe("icon files available"),
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
