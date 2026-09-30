import { describe, expect, it } from "vitest"

import {
  getStageIntentId,
  getStageReleaseState,
  isStageDashboardAvailable,
} from "@/components/domain/steps"

describe("getStageReleaseState", () => {
  const releasedStepIds = new Set(["step-01"])

  it("allows a known released Step to expose the Stage intent", () => {
    expect(
      getStageReleaseState("known", releasedStepIds, "step-01")
    ).toBe("released")
  })

  it("keeps a known unreleased Step pending", () => {
    expect(
      getStageReleaseState("known", releasedStepIds, "step-02")
    ).toBe("pending")
  })

  it("does not treat an unavailable release fact as released", () => {
    expect(
      getStageReleaseState("unknown", releasedStepIds, "step-01")
    ).toBe("unknown")
  })
})

describe("getStageIntentId", () => {
  it("emits the stable Stage identity instead of its display label", () => {
    expect(getStageIntentId("OXIDE_ETCH", "Oxide Etch")).toBe("OXIDE_ETCH")
  })

  it("keeps the display label as a compatibility fallback", () => {
    expect(getStageIntentId(undefined, "CLEAN")).toBe("CLEAN")
  })
})

describe("isStageDashboardAvailable", () => {
  it("uses the authoritative Stage catalog independently from release state", () => {
    expect(isStageDashboardAvailable(["ETCH"], "ETCH", "pending")).toBe(true)
    expect(isStageDashboardAvailable(["ETCH"], "CLEAN", "released")).toBe(false)
  })

  it("keeps the legacy release gate when no Stage catalog is supplied", () => {
    expect(isStageDashboardAvailable(undefined, "ETCH", "released")).toBe(true)
    expect(isStageDashboardAvailable(undefined, "ETCH", "pending")).toBe(false)
  })
})
