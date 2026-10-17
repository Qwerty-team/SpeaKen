import React from "react";
import { Link } from "react-router-dom";
import { Mic, History as HistoryIcon, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import StreakCounter from "@/components/practice/StreakCounter";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Mic className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            SpeaKen
          </span>
        </div>

        <StreakCounter />

        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-stone-600 transition hover:border-primary/40"
          >
            <HistoryIcon className="h-4 w-4" /> Progress
          </Link>
          <Link
            to="/profile"
            title="Profile"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card p-2 text-stone-600 transition hover:border-primary/40"
          >
            <UserIcon className="h-4 w-4" />
          </Link>
          <Link
            to="/settings"
            title="Settings"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card p-2 text-stone-600 transition hover:border-primary/40"
          >
            <SettingsIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
