import { describe, expect, it } from "bun:test";
import { bandPeak, updateBars } from "./recording-overlay";

describe("bandPeak", () => {
  it("returns 0 for an empty slice", () => {
    expect(bandPeak([0.5, 0.3], 1, 1)).toBe(0);
  });

  it("returns the single element when slice has length 1", () => {
    expect(bandPeak([0.1, 0.7, 0.3], 1, 2)).toBe(0.7);
  });

  it("returns the max across a range", () => {
    const levels = [0.1, 0.4, 0.9, 0.2, 0.6];
    expect(bandPeak(levels, 0, 5)).toBe(0.9);
  });

  it("respects start/end boundaries", () => {
    const levels = [0.9, 0.1, 0.2, 0.8, 0.3];
    // Only look at indices 1..3 (0.1, 0.2)
    expect(bandPeak(levels, 1, 3)).toBe(0.2);
  });
});

/** Minimal HTMLElement-like stub for testing updateBars without a DOM environment */
const makeStubContainer = () => {
  const bars = Array.from({ length: 4 }, () => ({
    style: { height: "", opacity: "" },
  }));
  return { children: bars } as unknown as HTMLDivElement;
};

describe("updateBars", () => {
  it("sets height and opacity on all 4 bar elements", () => {
    const container = makeStubContainer();
    const levels = [0.5, 0.5, 0.3, 0.3, 0.8, 0.8, 0.1, 0.1];
    updateBars(container, levels);

    for (let i = 0; i < 4; i++) {
      const el = container.children[i] as unknown as {
        style: { height: string; opacity: string };
      };
      expect(el.style.height).not.toBe("");
      expect(el.style.opacity).not.toBe("");
    }
  });

  it("applies power curve — higher input produces taller bars", () => {
    const container = makeStubContainer();
    // Band 0 = loud (1.0), Band 1 = quiet (0.05), rest 0
    const levels = new Array(64).fill(0);
    for (let i = 0; i < 16; i++) {
      levels[i] = 1.0;
    }
    for (let i = 16; i < 32; i++) {
      levels[i] = 0.05;
    }
    updateBars(container, levels);

    const h0 = Number.parseFloat(
      (
        container.children[0] as unknown as {
          style: { height: string };
        }
      ).style.height
    );
    const h1 = Number.parseFloat(
      (
        container.children[1] as unknown as {
          style: { height: string };
        }
      ).style.height
    );
    expect(h0).toBeGreaterThan(h1);
  });

  it("clamps minimum height to 20%", () => {
    const container = makeStubContainer();
    const levels = new Array(64).fill(0);
    updateBars(container, levels);

    for (let i = 0; i < 4; i++) {
      const h = Number.parseFloat(
        (
          container.children[i] as unknown as {
            style: { height: string };
          }
        ).style.height
      );
      expect(h).toBeCloseTo(20, 0);
    }
  });

  it("produces max ~100% height for peak=1.0", () => {
    const container = makeStubContainer();
    const levels = new Array(64).fill(1.0);
    updateBars(container, levels);

    for (let i = 0; i < 4; i++) {
      const h = Number.parseFloat(
        (
          container.children[i] as unknown as {
            style: { height: string };
          }
        ).style.height
      );
      expect(h).toBeCloseTo(100, 0);
    }
  });

  it("updates the same container on consecutive calls (no stale refs)", () => {
    const container = makeStubContainer();

    // First call — loud
    updateBars(container, new Array(64).fill(0.8));
    const firstHeights = Array.from(
      container.children as unknown as ArrayLike<{
        style: { height: string };
      }>
    ).map((el) => Number.parseFloat(el.style.height));

    // Second call — silent
    updateBars(container, new Array(64).fill(0));
    const secondHeights = Array.from(
      container.children as unknown as ArrayLike<{
        style: { height: string };
      }>
    ).map((el) => Number.parseFloat(el.style.height));

    // Heights should have changed
    for (let i = 0; i < 4; i++) {
      expect(secondHeights[i]).toBeLessThan(firstHeights[i]);
    }
  });
});
