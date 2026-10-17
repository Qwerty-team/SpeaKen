import React from "react";

function displayScore(s) {
  if (s.overall_score != null) return { value: Math.round(s.overall_score), label: "/ 100" };
  if (s.overall_band != null) return { value: s.overall_band.toFixed(1), label: "/ 9.0" };
  return { value: "—", label: "" };
}

export default function SessionCompare({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return <p className="py-10 text-center text-stone-500">No sessions to compare yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-stone-400">
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3">Scale</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const score = displayScore(s);
            return (
              <tr key={s.id} className="border-b border-border/60 last:border-0">
                <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">{s.topic}</td>
                <td className="px-4 py-3 text-stone-500">
                  {s.evaluation_scale === "ielts" ? "IELTS" : "100-pt"}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {score.value} <span className="text-xs text-stone-400">{score.label}</span>
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {new Date(s.created_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
