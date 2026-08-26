export const waferIds = Array.from({ length: 25 }, (_, index) => {
  return `AF.${String(index + 1).padStart(2, "0")}`
})

export const experimentFormDefaultsFixture = {
  lotId: "",
  experimentName: "",
  experimentDescription: "",
}

export const lotFixture = {
  lotId: "AF",
  productName: "S0269A · Power MOSFET",
  experimentName: "未命名DOE试验",
  experimentDescription: "未填写试验描述",
  stepCount: 18,
  waferCount: 25,
}

export const runCardsFixture = [
  {
    id: "RC-001",
    released: "0/2已下发",
    steps: [
      {
        id: "rc-001-oxide",
        label: "OXIDE_ETCH / MAIN",
        detail: "Seq 1 · Baseline / Variant A",
        selectedRunCard: "RC-001",
      },
      {
        id: "rc-001-clean",
        label: "CLEAN / MAIN",
        detail: "Seq 2 · Variant B · Time +10s",
        selectedRunCard: "RC-001",
      },
    ],
  },
  {
    id: "RC-002",
    released: "0/1已下发",
    steps: [
      {
        id: "rc-002-tape",
        label: "FS-TAPE / S-B-TAPE-B-01",
        detail: "Seq 3 · New Step",
        selectedRunCard: "RC-002",
      },
    ],
  },
]

export const parameterFixture = {
  name: "AML-SN080T24-TR-PH-ADI-69",
  observed: "2 observed wafers · 18 raw points · sample through 2026-04-19 21:11:53",
  lsl: "3.6",
  target: "4.0",
  usl: "4.4",
  cpk: "10.422",
}

export const parameterListFixture = [
  ["AML-SN080T24-TR-PH-ADI-69", "2 wafers · 18 raw"],
  ["AML-SN080T24-SG1-PH-OLX-69", "2 wafers · 18 raw"],
  ["AML-SN080T24-SG1-PH-OLY-69", "2 wafers · 18 raw"],
  ["AML-SN080T24-SG1-PH-RVX-69", "2 wafers · 72 raw"],
  ["AML-SN080T24-SG1-PH-RVY-69", "2 wafers · 72 raw"],
]

export const defectWafersFixture = [
  ["W01", "2 defects"],
  ["W02", "4 defects"],
  ["W08", "2 defects"],
  ["W11", "6 defects"],
  ["W24", "7 defects"],
  ["W25", "9 defects"],
]

export const runCardEventsFixture = [
  ["RC-002", "14:28:42", "FS-TAPE / S-B-TAPE-B-01", "通过", "前置条件及Recipe映射校验通过", "System"],
  ["RC-001", "14:20:16", "OXIDE_ETCH / MAIN", "OPEN", "Wafer 17在主工序进入Hold", "MES"],
  ["RC-001", "14:14:33", "OXIDE_ETCH / MAIN", "已接受", "生产Route已接受，18片Wafer进入队列", "MES"],
  ["RC-001", "14:08:05", "OXIDE_ETCH / MAIN", "运行中", "已在设备AWOXE01开始执行", "MES"],
  ["RC-001", "13:50:09", "CLEAN / MAIN", "TIMEOUT", "下发请求超过30秒响应窗口", "System"],
]

export const historyFixture = [
  ["刻蚀功率窗口确认试验", "AF01112", "进行中"],
  ["清洗时间参数优化试验", "AF01113", "已暂停"],
  ["光刻胶厚度基线试验", "AF01098", "已完成"],
  ["离子注入剂量探索试验", "AF01076", "已终止"],
]
