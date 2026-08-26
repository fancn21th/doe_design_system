import type { WaferInput } from "@/schemas/domain-component-inputs"
import {
  waferEmptyFixture,
  waferFixture,
  waferLargeDataFixture,
} from "@/components/domain/wafer.fixtures"

type WaferScenario = {
  name: string
  input: WaferInput
}

export const waferScenarios = {
  normal: {
    name: "normal",
    input: waferFixture,
  },
  parameterSelected: {
    name: "parameter-selected",
    input: {
      ...waferFixture,
      selectedParameterId: "AML-SN080T24-SG1-PH-RVX-69",
    },
  },
  largeData: {
    name: "large-data",
    input: waferLargeDataFixture,
  },
  empty: {
    name: "empty",
    input: waferEmptyFixture,
  },
  loading: {
    name: "loading",
    input: {
      ...waferFixture,
      parameters: [],
    },
  },
  error: {
    name: "error",
    input: {
      ...waferFixture,
      parameters: [],
    },
  },
  readonly: {
    name: "readonly",
    input: {
      ...waferFixture,
      readonly: true,
    },
  },
} satisfies Record<string, WaferScenario>
