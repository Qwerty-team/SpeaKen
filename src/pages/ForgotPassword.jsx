import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] p-4 sm:p-10">
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-3xl bg-white px-4 py-12 sm:min-h-[calc(100vh-5rem)]">
        <div className="w-full max-w-[326px]">
          {/* Header */}
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A5C40] text-white">
              <LogIn size={20} />
            </div>
            <h1 className="text-xl font-bold text-[#2B2118]">Forget Password?</h1>
            <h2 className="mt-5 text-xl font-semibold text-[#2B2118]">SpeaKen</h2>
          </div>

          {/* Card */}
          <div className="rounded-xl border border-[#EDE4D8] bg-[#FCFAF6] px-6 pb-5 pt-5">
            {sent ? (
              <div className="flex flex-col items-center py-2 text-center">
                <CheckCircle2 size={28} className="mb-3 text-[#7A5C40]" />
                <p className="text-sm font-medium text-[#2B2118]">Check your inbox</p>
                <p className="mt-1 text-xs text-[#9A7B5B]">
                  If an account exists for <span className="font-medium">{email}</span>, a
                  password reset link has been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="email" className="block text-xs font-medium text-[#2B2118]">
                  Email
                </label>
                <p className="mb-3 mt-0.5 text-[10px] leading-tight text-[#9A7B5B]">
                  Please enter the email address you'd like your password reset information sent to
                </p>

                <div className="flex items-center rounded-md border border-[#8C7A68] bg-white px-2.5 py-2 focus-within:border-[#7A5C40] focus-within:ring-1 focus-within:ring-[#7A5C40]">
                  <Mail size={14} className="mr-2 shrink-0 text-[#9A7B5B]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#2B2118] outline-none placeholder:text-[#9A7B5B]"
                  />
                </div>

                {error && <p className="mt-2 text-xs text-rose-700">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-md bg-[#7A5C40] py-2 text-xs font-medium text-white transition hover:bg-[#6A4F36] disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Request reset link"}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-[11px] tracking-wide text-[#9A7B5B] hover:text-[#7A5C40]"
              >
                BACK TO LOG IN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
