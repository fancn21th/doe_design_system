import { measurementEmptyFixture } from "@/components/domain/measurement.fixtures"
import { reportCpDataFixture } from "@/components/domain/report.fixtures"
import { reportCpDataSharedBaselineFixture, reportCpDataMissingCapabilityFixture, reportCpDataUnavailableDetailFixture } from "@/components/domain/report-cp-data.fixtures"
import type { ReportCpDataInput } from "@/schemas/domain-component-inputs"

type ReportCpDataScenario = { name: string; input: ReportCpDataInput }

export const reportCpDataScenarios = {
  sharedBaseline: { name: "shared-baseline", input: reportCpDataSharedBaselineFixture },
  missingCapability: { name: "missing-capability", input: reportCpDataMissingCapabilityFixture },
  unavailableDetail: { name: "unavailable-detail", input: reportCpDataUnavailableDetailFixture },
  normal: { name: "normal", input: reportCpDataFixture },
  cleared: { name: "cleared", input: { parameterOptions: reportCpDataFixture.parameterOptions, selectedParameterId: "" } },
  empty: { name: "empty", input: { parameterOptions: [], measurement: measurementEmptyFixture } },
} satisfies Record<string, ReportCpDataScenario>
