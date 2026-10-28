// Deterministic mock data for the agent observability dashboard.
let seed = 42;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const between = (a: number, b: number) => a + rnd() * (b - a);
const int = (a: number, b: number) => Math.round(between(a, b));

export const TOOLS = ["search", "metadata agent", "sql agent"] as const;
export const ITERATIVE_TOOLS = new Set(["sql agent", "metadata agent"]);
export const DOMAINS = ["domain1", "domain2", "domain3", "domain4", "domain5", "domain6", "domain7", "domain8"] as const;
export const MODELS = ["model1", "model2", "model3", "model4", "model5", "model6", "model7", "model8"] as const;
export const TOOL_COLORS: Record<string, string> = {
  search: "var(--chart-1)",
  "metadata agent": "var(--chart-3)",
  "sql agent": "var(--chart-2)",
};
export const DOMAIN_COLORS: Record<string, string> = {
  domain1: "var(--chart-1)",
  domain2: "var(--chart-2)",
  domain3: "var(--chart-3)",
  domain4: "var(--chart-4)",
  domain5: "var(--chart-5)",
  domain6: "var(--chart-1)",
  domain7: "var(--chart-2)",
  domain8: "var(--chart-3)",
};

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 9, 15 + i);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
});

export const toolCallTotals = TOOLS.map((t, i) => ({ tool: t, calls: [4820, 1980, 3110][i] ?? 0 }));

export const topSequences = [
  ["search", "answer"],
  ["search", "sql agent", "answer"],
  ["sql agent", "answer"],
  ["metadata agent", "sql agent", "answer"],
  ["search", "search", "answer"],
  ["metadata agent", "answer"],
  ["search", "metadata agent", "answer"],
  ["metadata agent", "sql agent", "sql agent", "answer"],
  ["sql agent", "sql agent", "answer"],
  ["search", "metadata agent", "sql agent", "answer"],
].map((seq, i) => ({ seq, count: [1820, 1140, 860, 610, 420, 310, 240, 190, 150, 120][i] ?? 0 }));
export const totalRequests = 6800;

export const transitionMatrix = TOOLS.map((from) => ({
  from,
  to: Object.fromEntries(
    [...TOOLS, "answer"].map((to) => [to, from === to ? int(50, 400) : int(20, 900)]),
  ) as Record<string, number>,
}));

export const coOccurrence = TOOLS.map((a) => ({
  a,
  b: Object.fromEntries(TOOLS.map((b) => [b, a === b ? 0 : 0])) as Record<string, number>,
}));
for (let i = 0; i < TOOLS.length; i++)
  for (let j = i + 1; j < TOOLS.length; j++) {
    const v = int(40, 1200);
    const a = coOccurrence[i];
    const b = coOccurrence[j];
    const toolA = TOOLS[i];
    const toolB = TOOLS[j];
    if (a && b && toolA && toolB) {
      a.b[toolB] = v;
      b.b[toolA] = v;
    }
  }

export const toolsPerIteration = Array.from({ length: 6 }, (_, i) => {
  const decay = Math.pow(0.55, i);
  return {
    iteration: `#${i + 1}`,
    ...Object.fromEntries(TOOLS.map((t, k) => [t, Math.round(([3000, 1200, 1500][k] ?? 0) * decay * between(0.7, 1.3))])),
  };
});

export const errorsTrend = days.map((day) => ({ day, errors: int(8, 60) }));
export const maxIterHitTrend = days.map((day) => ({ day, pct: +between(1.5, 9).toFixed(1) }));
export const latencyTrend = days.map((day) => {
  const rag = between(380, 620);
  const ttft = between(600, 1100);
  return {
    day,
    ragAvg: Math.round(rag), ragMin: Math.round(rag * 0.35), ragMax: Math.round(rag * between(2.2, 3.5)),
    ttftAvg: Math.round(ttft), ttftMin: Math.round(ttft * 0.4), ttftMax: Math.round(ttft * between(2, 3)),
  };
});
export const tokensTrend = days.map((day) => ({ day, input: int(1_800_000, 2_900_000), output: int(220_000, 420_000) }));

export const domainMetrics = [
  { domain: DOMAINS[0], requestCount: 1400, avgIterations: 1.82, inputTokens: 6_300_000, outputTokens: 840_000, avgToolCalls: 1.52, avgLlmCalls: 2.34 },
  { domain: DOMAINS[1], requestCount: 1100, avgIterations: 2.16, inputTokens: 5_610_000, outputTokens: 770_000, avgToolCalls: 1.83, avgLlmCalls: 2.71 },
  { domain: DOMAINS[2], requestCount: 1000, avgIterations: 2.48, inputTokens: 5_400_000, outputTokens: 800_000, avgToolCalls: 1.97, avgLlmCalls: 3.06 },
  { domain: DOMAINS[3], requestCount: 900, avgIterations: 2.94, inputTokens: 5_310_000, outputTokens: 810_000, avgToolCalls: 1.70, avgLlmCalls: 3.42 },
  { domain: DOMAINS[4], requestCount: 750, avgIterations: 2.05, inputTokens: 3_600_000, outputTokens: 525_000, avgToolCalls: 1.61, avgLlmCalls: 2.52 },
  { domain: DOMAINS[5], requestCount: 650, avgIterations: 3.12, inputTokens: 4_030_000, outputTokens: 650_000, avgToolCalls: 2.24, avgLlmCalls: 3.81 },
  { domain: DOMAINS[6], requestCount: 550, avgIterations: 1.67, inputTokens: 2_255_000, outputTokens: 275_000, avgToolCalls: 1.38, avgLlmCalls: 2.08 },
  { domain: DOMAINS[7], requestCount: 450, avgIterations: 2.63, inputTokens: 2_610_000, outputTokens: 405_000, avgToolCalls: 2.06, avgLlmCalls: 3.19 },
].map((row) => ({ ...row, weightedTokens: row.inputTokens + 3 * row.outputTokens }));

// Illustrative input weight 1, output weight 3. Allocate each domain's
// requests across models deterministically, preserving its request total.
export const modelDomainRequests = MODELS.map((model) => ({ model, domains: {} as Record<string, number> }));
domainMetrics.forEach((domain, domainIndex) => {
  const weights = MODELS.map((_, modelIndex) => 1 + ((modelIndex * 3 + domainIndex * 5) % 11));
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  let allocated = 0;
  modelDomainRequests.forEach((row, modelIndex) => {
    const requests = modelIndex === MODELS.length - 1
      ? domain.requestCount - allocated
      : Math.floor(domain.requestCount * (weights[modelIndex] ?? 1) / weightTotal);
    row.domains[domain.domain] = requests;
    allocated += requests;
  });
});

export const toolLatencyTrend = days.map((day) => {
  const row: Record<string, number | string> = { day };
  TOOLS.forEach((t, i) => {
    const avg = ([480, 1600, 2400][i] ?? 0) * between(0.8, 1.2);
    row[`${t}_avg`] = Math.round(avg);
    row[`${t}_min`] = Math.round(avg * 0.3);
    row[`${t}_max`] = Math.round(avg * between(2, 3.5));
  });
  return row;
});

export const toolTokens = TOOLS.map((t, i) => {
  const avg = [3200, 1500, 2100][i] ?? 0;
  const inputAvg = [2200, 1000, 1400][i] ?? 0;
  const outputAvg = avg - inputAvg;
  const calls = toolCallTotals[i]?.calls ?? 0;
  return { tool: t, avg, sum: avg * calls, inputAvg, outputAvg, inputSum: inputAvg * calls, outputSum: outputAvg * calls };
});

export const toolIterations = TOOLS.map((t) =>
  ITERATIVE_TOOLS.has(t)
    ? { tool: t, avgIterations: +between(2, 4.5).toFixed(2), modeIteration: int(1, 3) }
    : { tool: t, avgIterations: null, modeIteration: null },
);

export const toolErrors = TOOLS.map((t, i) => {
  const errors = [62, 48, 141][i] ?? 0;
  const calls = toolCallTotals[i]?.calls ?? 0;
  return { tool: t, errors, rate: calls ? +((errors / calls) * 100).toFixed(2) : 0 };
});
