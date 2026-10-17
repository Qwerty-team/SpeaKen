import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import SubNav from "@/components/SubNav";
import SessionCompare from "@/components/practice/SessionCompare";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Mic, ChevronDown, ChevronUp } from "lucide-react";
import { scoreTextColor, scoreBadgeClasses } from "@/lib/scoreColor";

function displayScore(s) {
  if (s.overall_score != null) return { value: s.overall_score, max: 100, label: "SCORE", display: Math.round(s.overall_score) };
  if (s.overall_band != null) return { value: s.overall_band, max: 9, label: "BAND", display: s.overall_band.toFixed(1) };
  return { value: 0, max: 100, label: "SCORE", display: 0 };
}

function normalizedPercent(s) {
  const { value, max } = displayScore(s);
  return (value / max) * 100;
}

export default function History() {
  const [sessions, setSessions] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState("progress");

  useEffect(() => {
    (async () => {
      try {
        const items = await api.sessions.list({ status: "completed", limit: 100 });
        setSessions(items);
      } catch {
        setSessions([]);
      }
    })();
  }, []);

  const completed = (sessions || []).filter((s) => s.overall_score != null || s.overall_band != null);

  const avgPct = completed.length
    ? Math.round(completed.reduce((a, s) => a + normalizedPercent(s), 0) / completed.length)
    : 0;
  const bestPct = completed.length
    ? Math.round(Math.max(...completed.map(normalizedPercent)))
    : 0;

  const chartData = [...completed].reverse().map((s, i) => ({
    label: `#${i + 1}`,
    score: Math.round(normalizedPercent(s)),
  }));

  return (
    <div className="min-h-screen">
      <SubNav title="Your progress" />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {sessions === null ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : completed.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Mic className="h-7 w-7 text-stone-400" />
            </div>
            <h2 className="mb-2 font-heading text-2xl font-semibold text-foreground">No sessions yet</h2>
            <p className="mb-6 text-stone-500">Complete your first practice session to see progress here.</p>
            <Link to="/">
              <Button size="lg">Start practicing</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 inline-flex gap-1 rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setTab("progress")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === "progress" ? "bg-primary text-primary-foreground" : "text-stone-500 hover:text-foreground"
                }`}
              >
                Progress overview
              </button>
              <button
                onClick={() => setTab("compare")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === "compare" ? "bg-primary text-primary-foreground" : "text-stone-500 hover:text-foreground"
                }`}
              >
                Compare sessions
              </button>
            </div>

            {tab === "progress" && (
              <>
                <div className="mb-8 grid grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wider text-stone-400">Sessions</div>
                    <div className="mt-1 font-heading text-3xl font-semibold text-foreground">{completed.length}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wider text-stone-400">Average</div>
                    <div className={`mt-1 font-heading text-3xl font-semibold ${scoreTextColor(avgPct)}`}>{avgPct}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="text-xs font-medium uppercase tracking-wider text-stone-400">Best</div>
                    <div className={`mt-1 font-heading text-3xl font-semibold ${scoreTextColor(bestPct)}`}>{bestPct}</div>
                  </div>
                </div>

                {chartData.length >= 2 && (
                  <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-stone-700">Score trend</h3>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 13 }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(v) => [`${v}%`, "Score"]}
                          />
                          <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-1))", r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {[...completed].reverse().map((s) => {
                    const isOpen = expanded === s.id;
                    const score = displayScore(s);
                    const pct = normalizedPercent(s);
                    return (
                      <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                        <button
                          onClick={() => setExpanded(isOpen ? null : s.id)}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/50"
                        >
                          <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${scoreBadgeClasses(pct)}`}>
                            <div className="text-lg font-bold leading-none tabular-nums">{score.display}</div>
                            <div className="text-[10px] font-medium uppercase tracking-wide">{score.label}</div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-foreground">{s.topic}</div>
                            <div className="mt-0.5 text-sm text-stone-400">
                              {s.language} · {s.category} · {s.evaluation_scale === "ielts" ? "IELTS" : "100-pt"} ·{" "}
                              {new Date(s.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </div>
                          {isOpen ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
                        </button>

                        {isOpen && (
                          <div className="border-t border-border/60 bg-muted/40 px-5 py-5">
                            {s.feedback_summary && (
                              <p className="mb-3 text-sm leading-relaxed text-stone-600">{s.feedback_summary}</p>
                            )}
                            {s.improvements?.length > 0 && (
                              <div>
                                <div className="mb-1.5 text-xs font-semibold text-stone-500">Recommendations</div>
                                <ul className="space-y-1.5">
                                  {s.improvements.map((it, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-stone-600">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                      <span>{it}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {tab === "compare" && <SessionCompare sessions={completed} />}
          </>
        )}
      </div>
    </div>
  );
}
