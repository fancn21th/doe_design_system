import { z } from "zod";

export const EvaluationStateSchema = z.enum([
  "READY",
  "PARTIAL",
  "NO_DATA",
  "DQ_ERROR",
  "FAILED",
  "N/A",
  "INSUFFICIENT_DATA",
]);

export type EvaluationState = z.infer<typeof EvaluationStateSchema>;
