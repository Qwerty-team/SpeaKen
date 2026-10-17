import React from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { Sparkles, Quote, Lightbulb, RotateCcw, History as HistoryIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoreTextColor } from "@/lib/scoreColor";

function downloadTextSummary(evaluation, session) {
  const lines = [
    `SpeaKen — session summary`,
    `Topic: ${session?.topic || ""}`,
    `Scale: ${evaluation.scale}`,
    "",
    evaluation.summary || "",
    "",
    "Recommendations:",
    ...(evaluation.improvements || []).map((r) => `- ${r}`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "speaken-summary.txt";
  a.click();
  URL.revokeObjectURL(url);
  // NOTE: a real PDF export would need a library like jspdf — this ships a
  // plain-text file so the "download" action works out of the box.
}

function Breakdown100({ evaluation }) {
  const rows = [
    ["Content", evaluation.content_score],
    ["Fluency", evaluation.fluency_score],
    ["Vocabulary", evaluation.vocabulary_score],
    ["Grammar", evaluation.grammar_score],
  ];
  const radarData = rows.map(([label, val]) => ({ label, value: val || 0 }));

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Performance breakdown</h3>
      <div className="mx-auto h-64 w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <Radar dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-2">
        {rows.map(([label, val]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
          >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className={`text-lg font-bold ${scoreTextColor(val || 0, 25)}`}>
              {Math.round(val || 0)}
              <span className="text-sm font-normal text-stone-400">/25</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownIelts({ evaluation }) {
  const rows = [
    ["Fluency & Coherence", evaluation.fluency_score],
    ["Lexical Resource", evaluation.vocabulary_score],
    ["Grammatical Range & Accuracy", evaluation.grammar_score],
    ["Pronunciation", evaluation.pronunciation_score],
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Band breakdown</h3>
      <div className="space-y-2">
        {rows.map(([label, val]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl bg-muted px-4 py-3"
          >
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className={`text-lg font-bold ${scoreTextColor(val || 0, 9)}`}>
              {(val || 0).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EvaluationResults({ evaluation, session, onNewSession }) {
  const navigate = useNavigate();
  if (!evaluation) return null;

  const isIelts = evaluation.scale === "ielts";
  const overall = isIelts ? evaluation.overall_band ?? 0 : evaluation.overall_score ?? 0;
  const max = isIelts ? 9 : 100;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" /> {isIelts ? "IELTS speaking evaluation" : "Your evaluation"}
        </span>
        <div className={`mt-3 font-heading text-6xl font-bold ${scoreTextColor(overall, max)}`}>
          {isIelts ? overall.toFixed(1) : Math.round(overall)}
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {isIelts ? "Overall band" : "Overall score"} · out of {max.toFixed(isIelts ? 1 : 0)}
        </p>
      </div>

      <div className="mt-6">
        {isIelts ? <BreakdownIelts evaluation={evaluation} /> : <Breakdown100 evaluation={evaluation} />}
      </div>

      {evaluation.feedback_summary && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Quote className="h-4 w-4" /> Summary
          </div>
          <p className="text-sm leading-relaxed text-stone-600">{evaluation.feedback_summary}</p>
        </div>
      )}

      {evaluation.improvements?.length > 0 && (
        <div className="mt-4 rounded-2xl bg-accent/60 p-5">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
            <Lightbulb className="h-4 w-4" /> Recommendations
          </div>
          <ul className="space-y-1.5">
            {evaluation.improvements.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm text-stone-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-1 text-sm font-semibold text-foreground">Filler words & pauses</div>
        <p className="text-sm text-stone-500">{evaluation.filler_words_notes || "No notes."}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button size="lg" onClick={onNewSession}>
          <RotateCcw className="h-4 w-4" /> New practice session
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/history")}>
          <HistoryIcon className="h-4 w-4" /> View progress
        </Button>
      </div>
      <Button
        variant="outline"
        className="mt-3 w-full"
        onClick={() => downloadTextSummary(evaluation, session)}
      >
        <Download className="h-4 w-4" /> Download summary report
      </Button>
    </div>
  );
}
