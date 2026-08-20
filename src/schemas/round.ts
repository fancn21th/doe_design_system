import { z } from "zod"

export const RoundSchema = z.object({
  id: z.string(),
  name: z.string(),
  product: z.string().optional(),
  lot: z.string(),
  splitVersion: z.string().optional(),
  waferCount: z.number().int().nonnegative(),
})

export type Round = z.infer<typeof RoundSchema>
