import { expect, it } from "vitest";
import * as M from "../lib/mock-data";

it("uses only search, metadata agent and sql agent in every tool dataset", () => {
  const tools = ["search", "metadata agent", "sql agent"];
  expect(M.TOOLS).toEqual(tools);
  for (const rows of [M.toolCallTotals, M.toolTokens, M.toolIterations, M.toolErrors]) {
    expect(rows.map((row) => row.tool)).toEqual(tools);
  }
  expect(Object.keys(M.TOOL_COLORS)).toEqual(tools);
  for (const row of M.topSequences) {
    expect(row.seq.every((step) => [...tools, "answer"].includes(step))).toBe(true);
  }
  expect(M.transitionMatrix.map((row) => row.from)).toEqual(tools);
  expect(M.coOccurrence.map((row) => row.a)).toEqual(tools);
  for (const row of M.toolsPerIteration) expect(Object.keys(row)).toEqual(["iteration", ...tools]);
});

it("keeps search single-step and reports iteration metrics for both agents", () => {
  expect(M.toolIterations.find((row) => row.tool === "search")).toMatchObject({ avgIterations: null, modeIteration: null });
  const agents = M.toolIterations.filter((row) => row.avgIterations !== null);
  expect(agents.map((row) => row.tool)).toEqual(["metadata agent", "sql agent"]);
  for (const row of agents) {
    expect(row.avgIterations).toBeGreaterThan(1);
    expect(row.modeIteration).toBeGreaterThanOrEqual(1);
  }
});