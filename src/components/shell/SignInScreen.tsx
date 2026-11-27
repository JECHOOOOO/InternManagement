"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface SignInScreenProps {
  onSignIn: (username: string, password: string) => { ok: boolean; error?: string };
  onSuccess: () => void;
}

export function SignInScreen({ onSignIn, onSuccess }: SignInScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onSignIn(username, password);
    if (!res.ok) {
      setError(res.error ?? "Mali ang username o password.");
      return;
    }
    setError(null);
    setPassword("");
    setForgotOpen(false);
    onSuccess();
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#06090a] px-4 py-10">
      <div className="w-full max-w-[26rem] rounded-2xl border border-[#161c1c] bg-[#020404] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.88)] sm:p-8">
        <div className="mb-5">
          <Image
            src="/ashai-logo.png"
            alt="Ashai Apparel Smart Hub"
            width={172}
            height={43}
            priority
            className="block h-11 w-auto select-none"
          />
        </div>

        <p className="mb-6 text-sm text-[var(--text-muted)]">
          Mag-sign in gamit ang account na binigay ng admin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="mb-1.5 block text-sm font-medium text-[#f3f6f6]"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              className="w-full rounded-lg border border-[#1f2626] bg-[#040707] px-3.5 py-2.5 text-sm text-[#f3f6f6] outline-none transition placeholder:text-[#93a3a3] hover:border-[#2e3a3a] focus:border-[#4dc4b2]"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-[#f3f6f6]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full rounded-lg border border-[#1f2626] bg-[#040707] py-2.5 pr-11 pl-3.5 text-sm text-[#f3f6f6] outline-none transition placeholder:text-[#93a3a3] hover:border-[#2e3a3a] focus:border-[#4dc4b2]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#93a3a3] transition hover:text-[#f3f6f6]"
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" aria-hidden="true" />
                ) : (
                  <Eye className="size-4.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-[#f87171]/40 bg-[rgba(248,113,113,0.12)] px-3 py-2 text-xs font-medium text-[#f87171]"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="ashai-tap-target mt-1 w-full rounded-lg bg-[#4dc4b2] px-4 py-2.5 text-sm font-bold text-[#041412] transition hover:bg-[#62d3c2]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 border-t border-[#161c1c] pt-4 text-center">
          <button
            type="button"
            onClick={() => setForgotOpen((prev) => !prev)}
            className="text-sm font-medium text-[#4dc4b2] transition hover:text-[#62d3c2]"
          >
            Nakalimutan ang password?
          </button>
          {forgotOpen ? (
            <p className="mt-2.5 rounded-lg border border-[#1b2424] bg-[#090d0d] px-3 py-2 text-xs leading-relaxed text-[#93a3a3]">
              Makipag-ugnayan sa iyong admin para ma-reset ang password ng
              account mo. (Demo UI — local accounts only.)
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
