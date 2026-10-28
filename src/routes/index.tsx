import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as M from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agent Tool Analytics Dashboard" },
      { name: "description", content: "Tool call, latency, token and error analytics for LLM agents." },
      { property: "og:title", content: "Agent Tool Analytics Dashboard" },
      { property: "og:description", content: "Tool call, latency, token and error analytics for LLM agents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false };
const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--foreground)" },
};
const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : `${n}`);

function Panel({ title, desc, children, action, wide }: { title: string; desc?: string; children: ReactNode; action?: ReactNode; wide?: boolean }) {
  return (
    <section className={`min-w-0 rounded-xl border bg-card p-5 shadow-panel ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
          {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Heat({ rows, cols, get, rowLabel }: { rows: string[]; cols: string[]; get: (r: string, c: string) => number; rowLabel: string }) {
  const max = Math.max(...rows.flatMap((r) => cols.map((c) => get(r, c))));
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 font-mono text-[11px]">
        <thead>
          <tr>
            <th className="text-left font-normal text-muted-foreground">{rowLabel}</th>
            {cols.map((c) => <th key={c} className="px-1 font-normal text-muted-foreground">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="pr-2 text-muted-foreground">{r}</td>
              {cols.map((c) => {
                const v = get(r, c);
                return (
                  <td key={c} className="heat-cell rounded text-center py-2" style={{ ["--heat" as string]: `${Math.round((v / max) * 55)}%` }}>
                    {v || "–"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-panel">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Overview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Requests" value={fmt(M.totalRequests)} />
        <Stat label="Tool calls" value={fmt(M.toolCallTotals.reduce((a, b) => a + b.calls, 0))} />
        <Stat label="Tool errors (14d)" value={fmt(M.errorsTrend.reduce((a, b) => a + b.errors, 0))} />
        <Stat label="Tokens (14d)" value={fmt(M.tokensTrend.reduce((a, b) => a + b.input + b.output, 0))} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Tool calls — total" desc="Number of calls per tool">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={M.toolCallTotals}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="tool" {...axis} /><YAxis {...axis} tickFormatter={fmt} />
              <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="calls" radius={[4, 4, 0, 0]} fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top tool-call sequences" desc="Full ordered sequence within one request (top 10)">
          <div className="space-y-2">
            {M.topSequences.map((s) => {
              const pct = (s.count / M.totalRequests) * 100;
              return (
                <div key={s.seq.join()} className="text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="truncate">{s.seq.join(" → ")}</span>
                    <span className="text-muted-foreground">{s.count} · {pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${pct * 3}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Transition matrix (A → B)" desc="Tool called directly after another tool">
          <Heat rowLabel="from / to" rows={[...M.TOOLS]} cols={[...M.TOOLS, "answer"]} get={(r, c) => M.transitionMatrix.find((x) => x.from === r)?.to[c] ?? 0} />
        </Panel>


        <Panel title="Tool distribution per iteration" desc="Calls per tool by agent iteration number" wide>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={M.toolsPerIteration}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="iteration" {...axis} /><YAxis {...axis} tickFormatter={fmt} />
              <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Legend wrapperStyle={{ fontSize: 11 }} />
              {M.TOOLS.map((t) => <Bar key={t} dataKey={t} stackId="a" fill={M.TOOL_COLORS[t]} />)}
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Tool errors over time">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={M.errorsTrend}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" {...axis} /><YAxis {...axis} />
              <Tooltip {...tip} />
              <Area dataKey="errors" stroke="var(--destructive)" fill="var(--destructive)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Max-iterations hit rate" desc="% of requests that hit the iteration limit">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={M.maxIterHitTrend}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" {...axis} /><YAxis {...axis} unit="%" />
              <Tooltip {...tip} />
              <Line dataKey="pct" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <LatencyPanel />

        <Panel title="Token usage — total" desc="Input vs output tokens per day">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={M.tokensTrend}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" {...axis} /><YAxis {...axis} tickFormatter={fmt} />
              <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="input" stackId="t" fill="var(--token-input)" />
              <Bar dataKey="output" stackId="t" fill="var(--token-output)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

function MinMaxAvg({ data, prefix, color, height = 240 }: { data: Record<string, unknown>[]; prefix: string; color: string; height?: number }) {
  const rows = data.map((d) => ({ ...d, range: [d[`${prefix}Min`] ?? d[`${prefix}_min`], d[`${prefix}Max`] ?? d[`${prefix}_max`]], avg: d[`${prefix}Avg`] ?? d[`${prefix}_avg`] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={rows}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" {...axis} /><YAxis {...axis} unit=" ms" width={60} />
        <Tooltip {...tip} />
        <Area dataKey="range" stroke="none" fill={color} fillOpacity={0.15} name="min–max" />
        <Line dataKey="avg" stroke={color} strokeWidth={2} dot={false} name="avg" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function LatencyPanel() {
  const [metric, setMetric] = useState<"rag" | "ttft">("rag");
  return (
    <Panel
      title={metric === "rag" ? "RAG latency" : "Time to first token"}
      desc="Average with min–max band"
      action={
        <Tabs value={metric} onValueChange={(v) => setMetric(v as "rag" | "ttft")}>
          <TabsList className="h-8"><TabsTrigger value="rag" className="text-xs">RAG</TabsTrigger><TabsTrigger value="ttft" className="text-xs">TTFT</TabsTrigger></TabsList>
        </Tabs>
      }
    >
      <MinMaxAvg data={M.latencyTrend} prefix={metric} color="var(--primary)" />
    </Panel>
  );
}

function DomainBar({ title, dataKey }: { title: string; dataKey: keyof (typeof M.domainMetrics)[number] }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={M.domainMetrics}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="domain" {...axis} interval={0} angle={-35} textAnchor="end" height={55} /><YAxis {...axis} tickFormatter={fmt} />
          <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey={dataKey} name={title} fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function Domains() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DomainBar title="Request count" dataKey="requestCount" />
      <DomainBar title="Avg iterations per request" dataKey="avgIterations" />
      <Panel title="Token usage" desc="Input and output tokens per domain">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={M.domainMetrics}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="domain" {...axis} interval={0} angle={-35} textAnchor="end" height={55} /><YAxis {...axis} tickFormatter={fmt} />
            <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="inputTokens" name="input" stackId="tokens" fill="var(--token-input)" />
            <Bar dataKey="outputTokens" name="output" stackId="tokens" fill="var(--token-output)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <DomainBar title="Avg tool calls per request" dataKey="avgToolCalls" />
      <DomainBar title="Avg LLM calls per request" dataKey="avgLlmCalls" />
      <DomainBar title="Waighted token usage" dataKey="weightedTokens" />
      <Panel title="Requests by model and domain" wide>
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <Heat rowLabel="model / domain" rows={[...M.MODELS]} cols={[...M.DOMAINS]} get={(model, domain) => M.modelDomainRequests.find((row) => row.model === model)?.domains[domain] ?? 0} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Fewer requests</span>
          {[0, 15, 30, 45, 55].map((heat) => <span key={heat} className="heat-cell h-3 w-6 rounded-sm" style={{ ["--heat" as string]: `${heat}%` }} />)}
          <span>More requests</span>
        </div>
      </Panel>
    </div>
  );
}

function Tools() {
  const [tool, setTool] = useState<string>(M.TOOLS[0]);
  const [tokMode, setTokMode] = useState<"avg" | "sum">("avg");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel
        title="Tool latency over time" desc="Average with min–max band" wide
        action={
          <Select value={tool} onValueChange={setTool}>
            <SelectTrigger className="h-8 w-[160px] font-mono text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{M.TOOLS.map((t) => <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>)}</SelectContent>
          </Select>
        }
      >
        <MinMaxAvg data={M.toolLatencyTrend} prefix={tool} color="var(--primary)" height={280} />
      </Panel>

      <Panel
        title="Token usage per tool" desc="Input and output tokens per tool"
        action={
          <Tabs value={tokMode} onValueChange={(v) => setTokMode(v as "avg" | "sum")}>
            <TabsList className="h-8"><TabsTrigger value="avg" className="text-xs">Avg / call</TabsTrigger><TabsTrigger value="sum" className="text-xs">Sum</TabsTrigger></TabsList>
          </Tabs>
        }
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={M.toolTokens} layout="vertical">
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis type="number" {...axis} tickFormatter={fmt} /><YAxis type="category" dataKey="tool" {...axis} width={110} />
            <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={tokMode === "avg" ? "inputAvg" : "inputSum"} name="input" stackId="tokens" fill="var(--token-input)" />
            <Bar dataKey={tokMode === "avg" ? "outputAvg" : "outputSum"} name="output" stackId="tokens" radius={[0, 4, 4, 0]} fill="var(--token-output)" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Iterations per tool call" desc="Iterative tools only (agentic SQL / metadata)">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr><th className="pb-2 text-left font-normal">Tool</th><th className="pb-2 text-right font-normal">Avg iterations</th><th className="pb-2 text-right font-normal">Most common iteration</th></tr>
          </thead>
          <tbody className="font-mono text-xs">
            {M.toolIterations.map((r) => (
              <tr key={r.tool} className="border-t">
                <td className="py-2.5">{r.tool}</td>
                <td className={`text-right ${r.avgIterations == null ? "text-muted-foreground" : ""}`}>{r.avgIterations ?? "n/a"}</td>
                <td className={`text-right ${r.modeIteration == null ? "text-muted-foreground" : ""}`}>{r.modeIteration ? `#${r.modeIteration}` : "n/a"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Errors per tool" desc="Number of failed calls per tool" wide>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={M.toolErrors}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="tool" {...axis} /><YAxis {...axis} />
            <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="errors" name="errors" fill="var(--destructive)" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Agent observability</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Tool Analytics</h1>
          </div>
          <span className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">Last 14 days · mock data</span>
        </header>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Aggregated</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="domains"><Domains /></TabsContent>
          <TabsContent value="tools"><Tools /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
