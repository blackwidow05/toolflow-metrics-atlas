// Deterministic mock data for the agent observability dashboard.
let seed = 42;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const between = (a: number, b: number) => a + rnd() * (b - a);
const int = (a: number, b: number) => Math.round(between(a, b));

export const TOOLS = ["rag_search", "sql_agent", "metadata_agent", "web_search", "calculator"] as const;
export const ITERATIVE_TOOLS = new Set(["sql_agent", "metadata_agent"]);
export const DOMAINS = ["finance", "hr", "sales", "legal"] as const;
export const TOOL_COLORS: Record<string, string> = {
  rag_search: "var(--chart-1)",
  sql_agent: "var(--chart-2)",
  metadata_agent: "var(--chart-3)",
  web_search: "var(--chart-4)",
  calculator: "var(--chart-5)",
};
export const DOMAIN_COLORS: Record<string, string> = {
  finance: "var(--chart-1)",
  hr: "var(--chart-2)",
  sales: "var(--chart-3)",
  legal: "var(--chart-4)",
};

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 9, 15 + i);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
});

export const toolCallTotals = TOOLS.map((t, i) => ({ tool: t, calls: [4820, 3110, 1980, 1240, 610][i]! }));

export const topSequences = [
  ["rag_search", "answer"],
  ["rag_search", "sql_agent", "answer"],
  ["sql_agent", "answer"],
  ["metadata_agent", "sql_agent", "answer"],
  ["rag_search", "rag_search", "answer"],
  ["web_search", "answer"],
  ["rag_search", "web_search", "answer"],
  ["metadata_agent", "sql_agent", "sql_agent", "answer"],
  ["sql_agent", "calculator", "answer"],
  ["rag_search", "sql_agent", "calculator", "answer"],
].map((seq, i) => ({ seq, count: [1820, 1140, 860, 610, 420, 310, 240, 190, 150, 120][i]! }));
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
    coOccurrence[i]!.b[TOOLS[j]!] = v;
    coOccurrence[j]!.b[TOOLS[i]!] = v;
  }

export const toolsPerIteration = Array.from({ length: 6 }, (_, i) => {
  const decay = Math.pow(0.55, i);
  return {
    iteration: `#${i + 1}`,
    ...Object.fromEntries(TOOLS.map((t, k) => [t, Math.round([3000, 1500, 1200, 600, 200][k]! * decay * between(0.7, 1.3) * (k === 4 ? 1 + i * 0.6 : 1))])),
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

export const domainTrend = days.map((day) => {
  const row: Record<string, number | string> = { day };
  DOMAINS.forEach((d, i) => {
    row[`iter_${d}`] = +between(1.4 + i * 0.3, 2.2 + i * 0.4).toFixed(2);
    row[`tokens_${d}`] = int(4000 + i * 1500, 7000 + i * 2500);
    row[`tools_${d}`] = +between(1.2 + i * 0.2, 2.4 + i * 0.3).toFixed(2);
    row[`llm_${d}`] = +between(2 + i * 0.3, 3.5 + i * 0.4).toFixed(2);
  });
  return row;
});

export const toolLatencyTrend = days.map((day) => {
  const row: Record<string, number | string> = { day };
  TOOLS.forEach((t, i) => {
    const avg = [480, 2400, 1600, 900, 40][i]! * between(0.8, 1.2);
    row[`${t}_avg`] = Math.round(avg);
    row[`${t}_min`] = Math.round(avg * 0.3);
    row[`${t}_max`] = Math.round(avg * between(2, 3.5));
  });
  return row;
});

export const toolTokens = TOOLS.map((t, i) => {
  const avg = [3200, 2100, 1500, 2600, 120][i]!;
  return { tool: t, avg, sum: avg * toolCallTotals[i]!.calls };
});

export const toolIterations = TOOLS.map((t) =>
  ITERATIVE_TOOLS.has(t)
    ? { tool: t, avgIterations: +between(2, 4.5).toFixed(2), modeIteration: int(1, 3) }
    : { tool: t, avgIterations: null, modeIteration: null },
);

export const toolErrors = TOOLS.map((t, i) => {
  const errors = [62, 141, 48, 77, 4][i]!;
  return { tool: t, errors, rate: +((errors / toolCallTotals[i]!.calls) * 100).toFixed(2) };
});
