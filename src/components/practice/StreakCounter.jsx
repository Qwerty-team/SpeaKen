import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { api } from "@/api/client";

function dayKey(d) {
  return d.toLocaleDateString("en-CA");
}

function computeStreak(sessions) {
  const dates = new Set(sessions.map((s) => dayKey(new Date(s.created_date))));
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  let cursor;
  if (dates.has(dayKey(today))) cursor = new Date(today);
  else if (dates.has(dayKey(yesterday))) cursor = new Date(yesterday);
  else return 0;
  let count = 0;
  const cur = new Date(cursor);
  while (dates.has(dayKey(cur))) {
    count++;
    cur.setDate(cur.getDate() - 1);
  }
  return count;
}

export default function StreakCounter() {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await api.sessions.list({ status: "completed", limit: 100 });
        setStreak(computeStreak(sessions));
      } catch {
        setStreak(0);
      }
    })();
  }, []);

  if (streak === null) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
      <Flame className="h-4 w-4" />
      {streak} {streak === 1 ? "day" : "days"}
    </div>
  );
}
