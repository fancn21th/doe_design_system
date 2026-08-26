import type {
  RunCardEvent,
  RunCardHistoryInput,
} from "@/schemas/domain-component-inputs"

export const runCardEventsFixture: RunCardEvent[] = [
  {
    runCardId: "RC-002",
    time: "14:28:42",
    step: "FS-TAPE / S-B-TAPE-B-01",
    status: "通过",
    description: "前置条件及Recipe映射校验通过",
    operator: "System",
  },
  {
    runCardId: "RC-001",
    time: "14:20:16",
    step: "OXIDE_ETCH / MAIN",
    status: "OPEN",
    description: "Wafer 17在主工序进入Hold",
    operator: "MES",
  },
  {
    runCardId: "RC-001",
    time: "14:14:33",
    step: "OXIDE_ETCH / MAIN",
    status: "已接受",
    description: "生产Route已接受，18片Wafer进入队列",
    operator: "MES",
  },
  {
    runCardId: "RC-001",
    time: "14:08:05",
    step: "OXIDE_ETCH / MAIN",
    status: "运行中",
    description: "已在设备AWOXE01开始执行",
    operator: "MES",
  },
  {
    runCardId: "RC-001",
    time: "13:50:09",
    step: "CLEAN / MAIN",
    status: "TIMEOUT",
    description: "下发请求超过30秒响应窗口",
    operator: "System",
  },
]

export const runCardHistoryFixture: Required<RunCardHistoryInput> = {
  events: runCardEventsFixture,
}
