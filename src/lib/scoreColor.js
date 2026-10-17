// Severity-based coloring for scores — always these literal colors,
// regardless of the active seasonal theme (so a low score always reads as a
// warning, a high score always reads as a win).

export function scoreTextColor(score, max = 100) {
  const pct = (score / max) * 100;
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 60) return "text-amber-600";
  return "text-rose-600";
}

export function scoreBadgeClasses(score, max = 100) {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (pct >= 60) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-rose-50 text-rose-600 border-rose-100";
}

export function scorePillClasses(score, max = 100) {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-emerald-50 text-emerald-700";
  if (pct >= 60) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-600";
}
