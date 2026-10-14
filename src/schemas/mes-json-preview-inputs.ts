import { z } from "zod"

export const mesJsonPreviewInputSchema = z.object({ json: z.string() })
export type MesJsonPreviewInput = z.infer<typeof mesJsonPreviewInputSchema>
