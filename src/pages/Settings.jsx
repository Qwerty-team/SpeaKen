import React from "react";
import { useSeasonalTheme } from "@/context/SeasonalTheme";
import { Check, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SubNav from "@/components/SubNav";

export default function Settings() {
  const { season, setSeason, decorationsEnabled, setDecorationsEnabled, SEASON_LIST } = useSeasonalTheme();

  return (
    <div className="min-h-screen">
      <SubNav title="Settings" maxWidth="max-w-3xl" />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Appearance
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Seasonal themes
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-stone-500">
            Choose a season to restyle the whole interface — colors, atmosphere and decorations.
            Your layout and features stay the same.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SEASON_LIST.map((s) => {
            const selected = season === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSeason(s.key)}
                className={`relative rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-primary bg-card shadow-sm ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <div className="mb-3 text-3xl">{s.emoji}</div>
                <div className="font-semibold text-foreground">{s.label}</div>
                <div className="mt-0.5 text-xs text-stone-400">{s.tagline}</div>
                <div className="mt-3 flex gap-1.5">
                  {s.swatches.map((c) => (
                    <span key={c} className="h-4 w-4 rounded-full border border-black/5" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {selected && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <h3 className="font-semibold text-foreground">Seasonal Decorations</h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">
              Show falling leaves, snowflakes, petals and particles that match the current season.
              The color palette stays either way.
            </p>
          </div>
          <Switch checked={decorationsEnabled} onCheckedChange={setDecorationsEnabled} />
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Your choice is saved on this device and stays active across pages.
        </p>
      </div>
    </div>
  );
}
