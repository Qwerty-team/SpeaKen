import React from "react";
import { Lock } from "lucide-react";

const ACHIEVEMENTS = [
  {
    key: "first_speech",
    emoji: "🏆",
    title: "First Speech",
    desc: "Complete your first speaking session",
    check: (s) => s.totalSessions >= 1,
  },
  {
    key: "streak_7",
    emoji: "🔥",
    title: "7 Day Streak",
    desc: "Practice for 7 days in a row",
    check: (s) => s.streak >= 7,
  },
  {
    key: "role_player",
    emoji: "🎭",
    title: "Role Player",
    desc: "Complete 10 random topic sessions",
    check: (s) => (s.randomCount || 0) >= 10,
  },
  {
    key: "knowledge_seeker",
    emoji: "📚",
    title: "Knowledge Seeker",
    desc: "Study 20 topics",
    check: (s) => s.topics >= 20,
  },
  {
    key: "confident_speaker",
    emoji: "⭐",
    title: "Confident Speaker",
    desc: "Complete 50 speaking sessions",
    check: (s) => s.totalSessions >= 50,
  },
];

export default function Achievements({ stats }) {
  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">Achievements</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = a.check(stats);
          return (
            <div
              key={a.key}
              className={`rounded-2xl border p-4 text-center shadow-sm ${
                unlocked ? "border-border bg-card" : "border-border/60 bg-accent/40"
              }`}
            >
              <div className="mb-2 text-3xl">{a.emoji}</div>
              <div className="font-semibold text-foreground">{a.title}</div>
              <div className="mt-0.5 text-xs text-stone-400">{a.desc}</div>
              <div
                className={`mt-2 text-xs font-semibold ${
                  unlocked ? "text-primary" : "inline-flex items-center gap-1 text-stone-400"
                }`}
              >
                {unlocked ? "Unlocked" : (
                  <>
                    <Lock className="h-3 w-3" /> Locked
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
