import type { WaferDefectInput } from "@/schemas/domain-component-inputs"
import {
  waferDefectEmptyFixture,
  waferDefectFixture,
  waferDefectManyTypesFixture,
  waferDefectNoImageFixture,
} from "@/components/domain/wafer-defect.fixtures"

type WaferDefectScenario = {
  name: string
  input: WaferDefectInput
}

export const waferDefectScenarios = {
  normal: {
    name: "normal",
    input: waferDefectFixture,
  },
  waferSelected: {
    name: "wafer-selected",
    input: {
      ...waferDefectFixture,
      selectedWaferId: "W24",
    },
  },
  manyDefectTypes: {
    name: "many-defect-types",
    input: waferDefectManyTypesFixture,
  },
  noImage: {
    name: "no-image",
    input: waferDefectNoImageFixture,
  },
  empty: {
    name: "empty",
    input: waferDefectEmptyFixture,
  },
  loading: {
    name: "loading",
    input: {
      ...waferDefectFixture,
      wafers: [],
      sourceNote: "SPC缺陷数据读取中。",
    },
  },
  error: {
    name: "error",
    input: {
      ...waferDefectFixture,
      wafers: [],
      sourceNote: "SPC缺陷数据暂不可用，请稍后重试。",
    },
  },
  readonly: {
    name: "readonly",
    input: {
      ...waferDefectFixture,
      readonly: true,
    },
  },
} satisfies Record<string, WaferDefectScenario>
