import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import { Pencil, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubNav from "@/components/SubNav";
import ProgressStats from "@/components/profile/ProgressStats";
import Achievements from "@/components/profile/Achievements";
import RecentActivity from "@/components/profile/RecentActivity";
import ProfileSettings from "@/components/profile/ProfileSettings";
import EditProfileDialog from "@/components/profile/EditProfileDialog";

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

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    const u = await api.auth.me();
    setUser(u);
    const items = await api.sessions.list({ status: "completed", limit: 100 });
    setSessions(items);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const completed = (sessions || []).filter((s) => s.overall_score != null || s.overall_band != null);
    const totalSessions = completed.length;
    const totalSeconds = completed.reduce((a, s) => a + (s.speaking_duration_seconds || 0), 0);
    const topics = new Set(completed.map((s) => s.topic)).size;
    const streak = computeStreak(completed);
    const normalized = completed.map((s) =>
      s.overall_score != null ? s.overall_score : (s.overall_band || 0) * (100 / 9)
    );
    const avg = totalSessions ? Math.round(normalized.reduce((a, v) => a + v, 0) / totalSessions) : 0;
    const catCount = {};
    completed.forEach((s) => {
      catCount[s.category] = (catCount[s.category] || 0) + 1;
    });
    const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const randomCount = catCount["Random"] || 0;
    return { completed, totalSessions, totalSeconds, topics, streak, avg, topCategory, catCount, randomCount };
  }, [sessions]);

  const handleLogout = async () => {
    await api.auth.logout();
    navigate("/login");
  };

  const handleUpdate = async (data) => {
    const updated = await api.auth.updateMe(data);
    setUser(updated || { ...user, ...data });
  };

  if (!user || !sessions) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  const displayName = user.display_name || user.full_name || "Learner";
  const username = user.username || "";
  const bio = user.bio || "";
  const avatarUrl = user.avatar_url;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <SubNav title="Profile" right={<Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4" /> Exit</Button>} />

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-semibold text-foreground">
              {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading text-2xl font-semibold text-foreground">{displayName}</h1>
              {username && <p className="text-sm text-stone-400">@{username}</p>}
              <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                {bio || "No bio yet — click Edit Profile to add one."}
              </p>
            </div>
            <Button onClick={() => setEditing(true)} variant="outline">
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </section>

        <ProgressStats stats={stats} />
        <Achievements stats={stats} />
        <RecentActivity sessions={stats.completed.slice(0, 5)} />
        <ProfileSettings user={user} onUpdate={handleUpdate} />
      </div>

      <EditProfileDialog open={editing} onOpenChange={setEditing} user={user} onSaved={handleUpdate} />
    </div>
  );
}
