import { expect, it } from "vitest";
import { toolTokens, toolCallTotals } from "../lib/mock-data";

it("splits tool tokens into input and output in average and total modes", () => {
  expect(toolTokens).toHaveLength(3);
  expect(toolTokens[0]).toMatchObject({ inputAvg: 2200, outputAvg: 1000, inputSum: 10604000, outputSum: 4820000 });
  for (const row of toolTokens) {
    const calls = toolCallTotals.find((item) => item.tool === row.tool)?.calls ?? 0;
    expect(row.inputAvg).toBeGreaterThan(0);
    expect(row.outputAvg).toBeGreaterThan(0);
    expect(row.inputAvg + row.outputAvg).toBe(row.avg);
    expect(row.inputSum + row.outputSum).toBe(row.sum);
    expect(row.inputSum).toBe(row.inputAvg * calls);
    expect(row.outputSum).toBe(row.outputAvg * calls);
  }
});