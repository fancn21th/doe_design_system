import { reportWaferMapFixture } from "@/components/domain/report.fixtures"
import type { ReportWaferMapInput } from "@/schemas/domain-component-inputs"

type ReportWaferMapScenario = { name: string; input: ReportWaferMapInput }

export const reportWaferMapScenarios = {
  normal: { name: "normal", input: reportWaferMapFixture },
  empty: { name: "empty", input: { mapViews: [] } },
  controlledPartial: {
    name: "controlledPartial",
    input: {
      mapViews: (reportWaferMapFixture.mapViews ?? []).filter((mapView) => mapView.kind === "cp-final-bin"),
      parameterOptions: [{ label: "BVDSS", value: "BVDSS" }],
      viewStates: [
        { view: "cp-final-bin", status: "ready" },
        { view: "cp-parameter", status: "unavailable", reason: "等待 BFF 共同色阶与有效性事实" },
        { view: "defect", status: "loading" },
      ],
      overlayState: {
        status: "unavailable",
        reason: "CP 与 Defect 坐标尚未对齐，不能可靠叠图。",
      },
    },
  },
} satisfies Record<string, ReportWaferMapScenario>
