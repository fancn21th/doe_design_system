import {
  reportManagementListFixture,
  reportVersionControlFixture,
} from "@/components/domain/report-management.fixtures"
import type {
  ReportManagementListInput,
  ReportVersionControlInput,
} from "@/schemas/domain-component-inputs"

type ListScenario = { name: string; input: ReportManagementListInput }
type VersionScenario = { name: string; input: ReportVersionControlInput }

export const reportManagementListScenarios = {
  normal: { name: "normal", input: reportManagementListFixture },
  loading: {
    name: "loading",
    input: { ...reportManagementListFixture, status: "loading", reports: [] },
  },
  empty: {
    name: "empty",
    input: { ...reportManagementListFixture, reports: [] },
  },
  error: {
    name: "error",
    input: {
      ...reportManagementListFixture,
      status: "error",
      reports: [],
      errorMessage: "Report Center catalog query failed.",
    },
  },
  readonly: {
    name: "readonly",
    input: { ...reportManagementListFixture, readonly: true },
  },
} satisfies Record<string, ListScenario>

export const reportVersionControlScenarios = {
  current: { name: "current", input: reportVersionControlFixture },
  historical: {
    name: "historical",
    input: {
      ...reportVersionControlFixture,
      selectedVersionId: "rptv_20260920_101500",
    },
  },
  loading: {
    name: "loading",
    input: { status: "loading", versions: [] },
  },
  empty: {
    name: "empty",
    input: { status: "ready", versions: [] },
  },
  error: {
    name: "error",
    input: {
      status: "error",
      errorMessage: "Version history query failed.",
      versions: [],
    },
  },
} satisfies Record<string, VersionScenario>
