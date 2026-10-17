import React from "react";
import { scoreBadgeClasses } from "@/lib/scoreColor";

function displayScore(s) {
  if (s.overall_score != null) return { value: Math.round(s.overall_score), max: 100 };
  if (s.overall_band != null) return { value: s.overall_band, max: 9, isBand: true };
  return { value: 0, max: 100 };
}

export default function RecentActivity({ sessions }) {
  if (!sessions || sessions.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">Recent Activity</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {sessions.map((s) => {
          const score = displayScore(s);
          const pct = (score.value / score.max) * 100;
          return (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${scoreBadgeClasses(pct)}`}>
                {score.isBand ? score.value.toFixed(0) : score.value}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{s.topic}</div>
                <div className="text-xs text-stone-400">
                  {s.category} · {new Date(s.created_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
