import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Mic, Clock, BookOpen, Flame, Award, Tag } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-stone-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="font-heading text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

export default function ProgressStats({ stats }) {
  const chartData = [...stats.completed].reverse().map((s, i) => ({
    label: `#${i + 1}`,
    score: Math.round(s.overall_score ?? (s.overall_band != null ? s.overall_band * (100 / 9) : 0)),
  }));

  const categories = Object.entries(stats.catCount || {}).sort((a, b) => b[1] - a[1]);
  const maxCat = categories.length ? categories[0][1] : 1;

  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">My Progress</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={Mic} label="Total sessions" value={stats.totalSessions} />
        <StatCard icon={Clock} label="Speaking time" value={`${stats.totalSeconds}s`} />
        <StatCard icon={BookOpen} label="Topics completed" value={stats.topics} />
        <StatCard icon={Flame} label="Current streak" value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`} />
        <StatCard icon={Award} label="Average score" value={stats.avg} />
        <StatCard icon={Tag} label="Top category" value={stats.topCategory} />
      </div>

      {chartData.length >= 2 && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
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
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-1))", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">Category breakdown</h3>
          <div className="space-y-2">
            {categories.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-stone-500">{cat}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
