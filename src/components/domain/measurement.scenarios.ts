import {
  measurementEmptyFixture,
  measurementFixture,
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
  empty: {
    name: "empty",
    input: measurementEmptyFixture,
  },
} satisfies Record<string, MeasurementScenario>
