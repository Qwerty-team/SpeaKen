import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "@/api/client";

const MIN_LENGTH = 8;

function PasswordField({ id, label, value, onChange, show, onToggle, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[#2B2118]">
        {label}
      </label>
      <div className="mt-1.5 flex items-center rounded-md border border-[#8C7A68] bg-white px-2.5 py-2 focus-within:border-[#7A5C40] focus-within:ring-1 focus-within:ring-[#7A5C40]">
        <Lock size={14} className="mr-2 shrink-0 text-[#9A7B5B]" />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs text-[#2B2118] outline-none placeholder:text-[#9A7B5B]"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="ml-2 shrink-0 text-[#9A7B5B] hover:text-[#7A5C40]"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  let content;

  if (!token) {
    content = (
      <div className="flex flex-col items-center py-2 text-center">
        <AlertCircle size={28} className="mb-3 text-[#7A5C40]" />
        <p className="text-sm font-medium text-[#2B2118]">Invalid reset link</p>
        <p className="mt-1 text-xs text-[#9A7B5B]">
          This link is missing or has expired. Please request a new one.
        </p>
        <Link
          to="/forgot-password"
          className="mt-5 w-full rounded-md bg-[#7A5C40] py-2 text-center text-xs font-medium text-white transition hover:bg-[#6A4F36]"
        >
          Request a new link
        </Link>
      </div>
    );
  } else if (done) {
    content = (
      <div className="flex flex-col items-center py-2 text-center">
        <CheckCircle2 size={28} className="mb-3 text-[#7A5C40]" />
        <p className="text-sm font-medium text-[#2B2118]">Password updated</p>
        <p className="mt-1 text-xs text-[#9A7B5B]">
          You can now log in with your new password.
        </p>
        <Link
          to="/login"
          className="mt-5 w-full rounded-md bg-[#7A5C40] py-2 text-center text-xs font-medium text-white transition hover:bg-[#6A4F36]"
        >
          Go to log in
        </Link>
      </div>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <p className="text-[10px] leading-tight text-[#9A7B5B]">
          Choose a new password with at least {MIN_LENGTH} characters
        </p>

        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          show={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
          autoComplete="new-password"
        />

        {error && <p className="text-xs text-rose-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="!mt-6 w-full rounded-md bg-[#7A5C40] py-2 text-xs font-medium text-white transition hover:bg-[#6A4F36] disabled:opacity-60"
        >
          {loading ? "Saving…" : "Reset password"}
        </button>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] p-4 sm:p-10">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-3xl bg-white px-4 py-12 sm:min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-[326px]">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A5C40] text-white">
              <KeyRound size={20} />
            </div>
            <h1 className="text-xl font-bold text-[#2B2118]">Reset Password</h1>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2118]">SpeaKen</h2>
          </div>

          <div className="rounded-xl border border-[#EDE4D8] bg-[#FCFAF6] px-6 pb-5 pt-5">
            {content}

            {!done && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-[11px] tracking-wide text-[#9A7B5B] hover:text-[#7A5C40]"
                >
                  BACK TO LOG IN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
