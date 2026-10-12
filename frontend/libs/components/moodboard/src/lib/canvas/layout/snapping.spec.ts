import { describe, expect, it } from "vitest";
import { SnapBox, computeSnap } from "./snapping";

const box = (x: number, y: number, w = 100, h = 100): SnapBox => ({
  x,
  y,
  width: w,
  height: h,
});

describe("computeSnap", () => {
  it("snaps a near-aligned left edge onto another node's left edge", () => {
    const moving = box(103, 400);
    const result = computeSnap(moving, [box(100, 0)], 6, null);
    expect(result.x).toBe(100);
    expect(result.guides.some((g) => g.axis === "x" && g.pos === 100)).toBe(true);
  });

  it("snaps centers together", () => {
    // Other center-x = 150. Moving (w=100) center aligns when x = 100.
    const moving = box(98, 400);
    const result = computeSnap(moving, [box(100, 0)], 6, null);
    expect(result.x).toBe(100);
  });

  it("leaves position untouched beyond the threshold", () => {
    const moving = box(120, 400);
    const result = computeSnap(moving, [box(100, 0)], 6, null);
    expect(result.x).toBe(120);
    expect(result.guides).toHaveLength(0);
  });

  it("falls back to the grid when no node aligns", () => {
    const moving = box(33, 65);
    const result = computeSnap(moving, [], 6, 32);
    expect(result.x).toBe(32);
    expect(result.y).toBe(64);
  });

  it("prefers node alignment over the grid on a given axis", () => {
    // x has a node edge at 100 (moving from 97) within threshold; grid=32 would
    // pull to 96 — node alignment must win.
    const moving = box(97, 400);
    const result = computeSnap(moving, [box(100, 0)], 6, 32);
    expect(result.x).toBe(100);
  });

  it("emits a guide spanning both boxes on the shared axis", () => {
    const moving = box(100, 300);
    const result = computeSnap(moving, [box(100, 0)], 6, null);
    const guide = result.guides.find((g) => g.axis === "x");
    expect(guide).toBeDefined();
    expect(guide?.from).toBe(0);
    expect(guide?.to).toBe(400);
  });
});

describe("computeSnap boundary and state invariants", () => {
  it("accepts an alignment exactly on the threshold", () => {
    const result = computeSnap(box(106, 400), [box(100, 0)], 6, null);
    expect(result.x).toBe(100);
    expect(result.guides).toHaveLength(1);
  });

  it("selects the closest node rather than the first eligible node", () => {
    const result = computeSnap(box(105, 400), [box(100, 0), box(108, 0)], 6, null);
    expect(result.x).toBe(108);
    expect(result.guides.find((guide) => guide.axis === "x")?.pos).toBe(108);
  });

  it("combines node X snapping with independent grid Y snapping", () => {
    const result = computeSnap(box(103, 65), [box(100, 400)], 6, 32);
    expect(result.x).toBe(100);
    expect(result.y).toBe(64);
    expect(result.guides.map((guide) => guide.axis)).toEqual(["x"]);
  });

  it("does not change input boxes or the candidate list", () => {
    const moving = box(103, 65);
    const others = [box(100, 400)];
    const originalMoving = { ...moving };
    const originalOthers = others.map((other) => ({ ...other }));
    const result = computeSnap(moving, others, 6, 32);
    expect(result.x).toBe(100);
    expect(moving).toEqual(originalMoving);
    expect(others).toEqual(originalOthers);
  });

  it("does not snap to a distant grid line and emits no guides", () => {
    const result = computeSnap(box(20, 20), [], 4, 32);
    expect(result).toEqual({ x: 20, y: 20, guides: [] });
  });
});
