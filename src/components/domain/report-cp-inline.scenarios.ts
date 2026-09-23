import {
  reportCpInlineConfiguredSpecFixture,
  reportCpInlineCoverageMismatchFixture,
  reportCpInlineDenseFixture,
  reportCpInlineEmptyFixture,
  reportCpInlineFixture,
  reportCpInlineInsufficientLevelsFixture,
  reportCpInlinePartialFixture,
} from "@/components/domain/report-cp-inline.fixtures"
import type { ReportCpInlineInput } from "@/schemas/domain-component-inputs"

type ReportCpInlineScenario = { name: string; input: ReportCpInlineInput }

export const reportCpInlineScenarios = {
  normal: { name: "normal", input: reportCpInlineFixture },
  configuredSpec: {
    name: "configured-spec",
    input: reportCpInlineConfiguredSpecFixture,
  },
  coverageMismatch: {
    name: "coverage-mismatch",
    input: reportCpInlineCoverageMismatchFixture,
  },
  insufficientLevels: {
    name: "insufficient-levels",
    input: reportCpInlineInsufficientLevelsFixture,
  },
  partial: { name: "partial", input: reportCpInlinePartialFixture },
  empty: { name: "empty", input: reportCpInlineEmptyFixture },
  dense: { name: "dense", input: reportCpInlineDenseFixture },
} satisfies Record<string, ReportCpInlineScenario>
