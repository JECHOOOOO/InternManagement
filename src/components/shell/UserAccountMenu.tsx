"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import type { InternProfile } from "@/types/intern";

interface UserAccountMenuProps {
  profile: InternProfile;
  isLight: boolean;
  variant: "desktop" | "mobile";
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function UserAccountMenu({
  profile,
  isLight,
  variant,
  onToggleTheme,
  onSignOut,
}: UserAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {variant === "mobile" ? (
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2 pl-1 text-xs font-bold text-white transition hover:bg-white/15"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-[#4dc4b2] text-[0.7rem] font-extrabold text-[#041b18]">
            {profile.initials}
          </span>
          <ChevronDown
            className={`size-3.5 text-[#c1cccc] transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1.5 text-xs font-bold transition ${
            isLight
              ? "bg-[#182221] text-[#f3f6f6] hover:bg-[#22302e]"
              : "bg-[#e5ecea] text-[#0b1412] hover:bg-[#d8e3e0]"
          }`}
        >
          {profile.avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarDataUrl}
              alt={`${profile.fullName} avatar`}
              className="size-7 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className={`flex size-7 items-center justify-center rounded-full text-[0.7rem] font-extrabold ${
                isLight
                  ? "bg-[#147a6a] text-white"
                  : "bg-[#4dc4b2] text-[#041b18]"
              }`}
            >
              {profile.initials}
            </span>
          )}
          <span className="max-w-36 truncate">{profile.fullName}</span>
          <ChevronDown
            className={`size-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      )}

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-2xl"
        >
          <div className="border-b border-[var(--border-subtle)] px-3 py-2.5">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
              {profile.fullName}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[var(--accent-teal)]">
              {profile.roleLabel}
            </p>
          </div>

          <div className="mt-1.5 space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleTheme();
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
            >
              <span className="inline-flex items-center gap-2.5">
                {isLight ? (
                  <Moon
                    className="size-4 text-[var(--accent-teal)]"
                    aria-hidden="true"
                  />
                ) : (
                  <Sun
                    className="size-4 text-[var(--accent-teal)]"
                    aria-hidden="true"
                  />
                )}
                <span>{isLight ? "Dark mode" : "Light mode"}</span>
              </span>
              <span className="rounded-md bg-[var(--bg-pill)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--text-muted)]">
                {isLight ? "Light" : "Dark"}
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--accent-danger)] transition hover:bg-[var(--accent-danger-soft)]"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
