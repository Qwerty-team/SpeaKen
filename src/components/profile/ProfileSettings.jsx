import React, { useState } from "react";
import { Globe, Bell, Award, Check } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSeasonalTheme } from "@/context/SeasonalTheme";

const LANGUAGES = ["English","German"];

function useLocalToggle(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? defaultValue : stored === "true";
    } catch {
      return defaultValue;
    }
  });
  const update = (v) => {
    setValue(v);
    try {
      localStorage.setItem(key, String(v));
    } catch {
      /* ignore */
    }
  };
  return [value, update];
}

export default function ProfileSettings({ user, onUpdate }) {
  const { season, setSeason, SEASON_LIST } = useSeasonalTheme();
  const [reminders, setReminders] = useLocalToggle("speaken_reminders", false);
  const [achievementAlerts, setAchievementAlerts] = useLocalToggle("speaken_achievement_alerts", false);

  return (
    <section>
      <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">Profile Settings</h2>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">Language</div>
                <div className="text-xs text-stone-400">Your preferred practice language</div>
              </div>
            </div>
            <Select
              className="w-36"
              value={user.language || "English"}
              onChange={(e) => onUpdate({ language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Bell className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">Practice reminders</div>
                <div className="text-xs text-stone-400">Get nudged to keep your streak</div>
              </div>
            </div>
            <Switch checked={reminders} onCheckedChange={setReminders} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium text-foreground">Achievement alerts</div>
                <div className="text-xs text-stone-400">Celebrate when you unlock badges</div>
              </div>
            </div>
            <Switch checked={achievementAlerts} onCheckedChange={setAchievementAlerts} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <p className="mb-4 text-xs text-stone-400">
          Choose a season — the whole interface restyles instantly.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SEASON_LIST.map((s) => {
            const selected = season === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSeason(s.key)}
                className={`relative rounded-xl border p-3 text-left transition ${
                  selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-sm font-semibold text-foreground">{s.label}</div>
                <div className="text-xs text-stone-400">{s.tagline}</div>
                {selected && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
