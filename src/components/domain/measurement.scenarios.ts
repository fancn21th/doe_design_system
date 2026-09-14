import {
  measurementEmptyFixture,
  measurementFixture,
  measurementPendingFixture,
  measurementSmallFixture,
  measurementUnavailableFixture,
} from "@/components/domain/measurement.fixtures"
import type { MeasurementInput } from "@/schemas/domain-component-inputs"

type MeasurementScenario = {
  name: string
  input: MeasurementInput
}

export const measurementScenarios = {
  normal: {
    name: "normal",
    input: measurementFixture,
  },
  compact: {
    name: "compact",
    input: measurementSmallFixture,
  },
  empty: {
    name: "empty",
    input: measurementEmptyFixture,
  },
  pending: {
    name: "pending",
    input: measurementPendingFixture,
  },
  unavailable: {
    name: "unavailable",
    input: measurementUnavailableFixture,
  },
} satisfies Record<string, MeasurementScenario>
