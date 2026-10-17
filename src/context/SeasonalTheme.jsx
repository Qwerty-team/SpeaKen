import React, { createContext, useContext, useEffect, useState } from "react";
import { SEASON_LIST, DEFAULT_SEASON, getSeason } from "@/lib/seasonalPalettes";

const SeasonalThemeContext = createContext(null);

const STORAGE_KEY = "speaken_season";
const DECOR_KEY = "speaken_decorations";

function applySeasonVars(seasonKey) {
  const season = getSeason(seasonKey);
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(season.vars)) {
    root.style.setProperty(prop, value);
  }
}

export function SeasonalThemeProvider({ children }) {
  const [season, setSeasonState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_SEASON;
    } catch {
      return DEFAULT_SEASON;
    }
  });
  const [decorationsEnabled, setDecorationsEnabledState] = useState(() => {
    try {
      return localStorage.getItem(DECOR_KEY) !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    applySeasonVars(season);
  }, [season]);

  const setSeason = (key) => {
    setSeasonState(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      /* ignore storage errors (private browsing, etc.) */
    }
  };

  const setDecorationsEnabled = (value) => {
    setDecorationsEnabledState(value);
    try {
      localStorage.setItem(DECOR_KEY, String(value));
    } catch {
      /* ignore */
    }
  };

  return (
    <SeasonalThemeContext.Provider
      value={{ season, setSeason, decorationsEnabled, setDecorationsEnabled, SEASON_LIST }}
    >
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  const ctx = useContext(SeasonalThemeContext);
  if (!ctx) throw new Error("useSeasonalTheme must be used within SeasonalThemeProvider");
  return ctx;
}
