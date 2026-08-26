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

export const historyFixture = [
  ["刻蚀功率窗口确认试验", "AF01112", "进行中"],
  ["清洗时间参数优化试验", "AF01113", "已暂停"],
  ["光刻胶厚度基线试验", "AF01098", "已完成"],
  ["离子注入剂量探索试验", "AF01076", "已终止"],
]
