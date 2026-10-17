import React, { useEffect, useRef, useState } from "react";
import { BookOpen, RotateCcw, Lightbulb, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ResearchPhase({ session, onStart, onNewTopic }) {
  const duration = session?.research_duration_seconds || 900;
  const [remaining, setRemaining] = useState(duration);
  const startedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
  }, [session?.id, duration]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!startedRef.current) {
        startedRef.current = true;
        onStart();
      }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onStart]);

  if (!session) return null;

  const progressPct = Math.max(0, Math.min(100, (1 - remaining / duration) * 100));
  const vocabulary = session._vocabulary || [];
  const keyFacts = session._key_facts || [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
          <BookOpen className="h-3.5 w-3.5" /> Study phase
        </span>
        <button
          onClick={onNewTopic}
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> New topic
        </button>
      </div>

      <div className="text-center">
        <div className="font-heading text-6xl font-bold tabular-nums text-foreground">
          {formatTime(remaining)}
        </div>
        <p className="mt-1 text-sm text-stone-500">Read the material and prepare your ideas</p>
        <div className="mx-auto mt-3 h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
          {session.language} · {session.category}
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          {session.topic}
        </h1>
        {session._description && (
          <p className="mt-3 font-medium text-primary/80">{session._description}</p>
        )}

        {session._reading_text && (
          <div className="mt-6">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4" /> About this topic
            </div>
            <p className="whitespace-pre-line leading-relaxed text-stone-600">
              {session._reading_text}
            </p>
          </div>
        )}

        {keyFacts.length > 0 && (
          <div className="mt-6 rounded-2xl bg-accent/60 p-5">
            <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
              <Lightbulb className="h-4 w-4" /> Key facts to remember
            </div>
            <ul className="space-y-2">
              {keyFacts.map((fact, i) => (
                <li key={i} className="flex gap-2 text-sm text-stone-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {vocabulary.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 text-sm font-semibold text-foreground">Key vocabulary</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vocabulary.map((v, i) => (
                <div key={i} className="rounded-xl bg-accent/60 p-3">
                  <div className="font-semibold text-foreground">{v.term}</div>
                  <div className="text-sm text-stone-500">{v.definition}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-stone-500">
        Use the next {formatTime(remaining)} to read and study the material above. When the timer
        ends, your camera and microphone will activate automatically — present what you learned
        without reading a script.
      </p>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={() => {
          startedRef.current = true;
          onStart();
        }}
      >
        <Play className="h-4 w-4" /> I'm ready, start presentation
      </Button>
    </div>
  );
}
