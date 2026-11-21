import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/api/client";

const AuthContext = createContext(null);

const LOCAL_ACCOUNT = {
  email: import.meta.env.VITE_LOCAL_DEMO_EMAIL || "",
  password: import.meta.env.VITE_LOCAL_DEMO_PASSWORD || "",
};
const LOCAL_USER_KEY = "speaken_local_user";

function buildLocalUser(email) {
  return {
    id: "local-demo-user",
    email,
    display_name: email.split("@")[0],
    full_name: "",
    username: email.split("@")[0],
    bio: "",
    avatar_url: "",
    language: "English",
    created_date: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
        return;
      }
    } catch {
    }

    try {
      const u = await api.auth.me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  const loginLocal = useCallback((email, password) => {
       if (
      LOCAL_ACCOUNT.email &&
      LOCAL_ACCOUNT.password &&
      email === LOCAL_ACCOUNT.email &&
      password === LOCAL_ACCOUNT.password
    )  {
      const u = buildLocalUser(email);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
      } catch {
      }
      setUser(u);
      setLoading(false);
      return true;
    }
    return false;
  }, []);

  const logoutLocal = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch {
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh, loginLocal, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
