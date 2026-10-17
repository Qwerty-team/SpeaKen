import React, { useState } from "react";
import { Sparkles, Globe, BarChart3, Clock, Mic, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const LANGUAGES = ["English", "Spanish", "French", "German", "Russian", "Kazakh"];
const CATEGORIES = [
  "Random",
  "Business",
  "Technology",
  "Environment",
  "Society",
  "Health",
  "Travel",
  "Education",
];
const DIFFICULTIES = [
  { key: "beginner", label: "Beginner", hint: "Everyday, concrete" },
  { key: "intermediate", label: "Intermediate", hint: "Balanced" },
  { key: "advanced", label: "Advanced", hint: "Nuanced, abstract" },
];
const TIME_LIMITS = [1, 2, 3, 5];
const EVAL_SCALES = [
  { key: "100-point", label: "100-point", hint: "4 criteria × 25" },
  { key: "ielts", label: "IELTS Speaking", hint: "Bands 0–9" },
];

function OptionCard({ selected, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-center transition ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function PracticeSetup({ onGenerate, loading }) {
  const [language, setLanguage] = useState("English");
  const [category, setCategory] = useState("Random");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [timeLimit, setTimeLimit] = useState(3);
  const [evalScale, setEvalScale] = useState("100-point");

  const handleSubmit = () => {
    onGenerate(language, category, timeLimit, difficulty, evalScale);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
        <Sparkles className="h-3.5 w-3.5" /> Speaking practice
      </div>

      <h1 className="font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">
        Speak with confidence.
      </h1>
      <h2 className="font-heading text-4xl font-bold leading-tight text-primary/70 sm:text-5xl">
        One random topic at a time.
      </h2>

      <p className="mx-auto mt-5 max-w-xl text-stone-500">
        Get a random topic, research it for fifteen minutes, then present it on camera.
        Receive instant, detailed feedback on your speaking.
      </p>

      <div className="mt-10 rounded-3xl border border-border bg-card p-6 text-left shadow-sm sm:p-8">
        <div className="space-y-6">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Globe className="h-4 w-4 text-primary" /> Practice language
            </label>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Topic category
            </label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" /> Difficulty level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <OptionCard
                  key={d.key}
                  selected={difficulty === d.key}
                  onClick={() => setDifficulty(d.key)}
                >
                  <div className="font-semibold">{d.label}</div>
                  <div
                    className={`text-xs ${
                      difficulty === d.key ? "text-primary-foreground/80" : "text-stone-400"
                    }`}
                  >
                    {d.hint}
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Speaking time limit
            </label>
            <div className="grid grid-cols-4 gap-3">
              {TIME_LIMITS.map((t) => (
                <OptionCard key={t} selected={timeLimit === t} onClick={() => setTimeLimit(t)}>
                  <span className="font-semibold">
                    {t} {t === 1 ? "minute" : "minutes"}
                  </span>
                </OptionCard>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" /> Evaluation scale
            </label>
            <div className="grid grid-cols-2 gap-3">
              {EVAL_SCALES.map((s) => (
                <OptionCard
                  key={s.key}
                  selected={evalScale === s.key}
                  onClick={() => setEvalScale(s.key)}
                  className="text-left"
                >
                  <div className="font-semibold">{s.label}</div>
                  <div
                    className={`text-xs ${
                      evalScale === s.key ? "text-primary-foreground/80" : "text-stone-400"
                    }`}
                  >
                    {s.hint}
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating topic...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Generate topic & begin <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-stone-400">
        <span>15 min research</span>
        <span>•</span>
        <span>Camera + mic</span>
        <span>•</span>
        <span>AI evaluation</span>
      </div>
    </div>
  );
}
