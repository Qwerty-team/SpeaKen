const BASE_URL = import.meta.env.VITE_API_URL || "";

const LOCAL_USER_KEY = "speaken_local_user";
const LOCAL_SESSIONS_KEY = "speaken_local_sessions";

function isLocalMode() {
  try {
    return !!localStorage.getItem(LOCAL_USER_KEY);
  } catch {
    return false;
  }
}

function loadLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalUser(user) {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } catch {
  }
}

function loadLocalSessions() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSessions(list) {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(list));
  } catch {
  }
}

function makeId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  topics: {
  async list() {
    const data = await request("/api/v1/topics/");
    return Array.isArray(data) ? data : data.results ?? data.topics ?? [];
  },
},

  auth: {
    me() {
      if (isLocalMode()) return Promise.resolve(loadLocalUser());
      return request("/api/auth/me");
    },
    login(email, password) {

      return request("/api/auth/login", { method: "POST", body: { email, password } });
    },
    register(email, password) {
      return request("/api/auth/register", { method: "POST", body: { email, password } });
    },
    async logout() {
      if (isLocalMode()) {
        try {
          localStorage.removeItem(LOCAL_USER_KEY);
        } catch {
        }
        return;
      }
      await request("/api/auth/logout", { method: "POST" });
    },
    updateMe(data) {
      if (isLocalMode()) {
        const updated = { ...loadLocalUser(), ...data };
        saveLocalUser(updated);
        return Promise.resolve(updated);
      }
      return request("/api/auth/me", { method: "PATCH", body: data });
    },
    loginWithGoogle(returnTo = "/") {
      window.location.href = `${BASE_URL}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
    },
  },

  sessions: {
    list({ status, limit = 100 } = {}) {
      if (isLocalMode()) {
        let items = loadLocalSessions();
        if (status) items = items.filter((s) => s.status === status);
        items = items.slice().sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        return Promise.resolve(items.slice(0, limit));
      }
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("limit", String(limit));
      return request(`/api/sessions?${params.toString()}`);
    },
    create(data) {
      if (isLocalMode()) {
        const session = { id: makeId(), created_date: new Date().toISOString(), ...data };
        const items = loadLocalSessions();
        items.push(session);
        saveLocalSessions(items);
        return Promise.resolve(session);
      }
      return request("/api/sessions", { method: "POST", body: data });
    },
    update(id, data) {
      if (isLocalMode()) {
        const items = loadLocalSessions();
        const idx = items.findIndex((s) => s.id === id);
        if (idx === -1) return Promise.resolve(null);
        items[idx] = { ...items[idx], ...data };
        saveLocalSessions(items);
        return Promise.resolve(items[idx]);
      }
      return request(`/api/sessions/${id}`, { method: "PATCH", body: data });
    },
  },

  functions: {
    generateTopic(payload) {
      if (isLocalMode()) {
        const { language = "English", category = "General", difficulty = "intermediate" } = payload || {};
        return Promise.resolve({
          topic: "The Impact of Remote Work on Urban Centers",
          description:
            "An analysis of how the shift toward working from home is reshaping the economy and social atmosphere of large cities.",
          reading_text:
            `[Local demo data] This is where generated background reading for a ${difficulty} ` +
            `${category} topic in ${language} would appear once a real AI provider is wired up.`,
          key_facts: [
            "Placeholder fact one about the topic.",
            "Placeholder fact two about the topic.",
            "Placeholder fact three about the topic.",
          ],
          vocabulary: [
            { term: "Commuter", definition: "Someone who travels regularly between home and work." },
            { term: "Ecosystem", definition: "A placeholder vocabulary entry for this topic." },
            { term: "Revitalize", definition: "To give new life or energy to something." },
            { term: "Hybrid model", definition: "A placeholder vocabulary entry for this topic." },
          ],
        });
      }
      return request("/api/functions/generateTopic", { method: "POST", body: payload });
    },
    analyzePresentation(payload) {
      if (isLocalMode()) {
        const { speaking_duration_seconds = 0, evaluation_scale = "100-point" } = payload || {};
        const base = {
          scale: evaluation_scale,
          transcript: "[Local demo data] No real speech-to-text is wired up yet in this offline preview.",
          feedback_summary: "No speech was detected in your recording. Score: 0.",
          strengths: [],
          improvements: ["Make sure to speak aloud during your presentation so your speech can be evaluated."],
          filler_words_notes: speaking_duration_seconds > 0 ? "No speech detected." : "No recording to analyze.",
        };
        if (evaluation_scale === "ielts") {
          return Promise.resolve({
            ...base,
            overall_band: 0,
            fluency_score: 0,
            vocabulary_score: 0,
            grammar_score: 0,
            pronunciation_score: 0,
          });
        }
        return Promise.resolve({
          ...base,
          overall_score: 0,
          content_score: 0,
          fluency_score: 0,
          vocabulary_score: 0,
          grammar_score: 0,
        });
      }
      return request("/api/functions/analyzePresentation", { method: "POST", body: payload });
    },
  },

  async uploadFile(file) {
    if (isLocalMode()) {
      return { file_url: URL.createObjectURL(file) };
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
};
