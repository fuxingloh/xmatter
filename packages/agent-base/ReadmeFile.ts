import { z } from "zod";

export const ReadmeFileSchema = z.object({
  data: z.object({
    name: z
      .string()
      .min(1)
      .regex(/^(?!\s)(?!.*\s$).*$/),
    provenance: z.string().describe("Where did this entry come from?"),
    standards: z.array(z.string()),
    symbol: z
      .string()
      .min(1)
      .regex(/^(?!\s)(?!.*\s$).*$/)
      .optional(),
    decimals: z.number().int().min(0).max(256).optional(),
    tags: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          name: z.string(),
          url: z.url(),
        }),
      )
      .optional(),
  }),
  content: z.string(),
});

export type ReadmeFile = z.infer<typeof ReadmeFileSchema>;
