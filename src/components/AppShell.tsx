"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Clock,
  FilePenLine,
  Home,
  MoreHorizontal,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import {
  APP_BUILD_TAG,
  MORE_KNOWLEDGE_CATEGORIES,
} from "@/data/demoData";
import type { NavRoute } from "@/types/intern";

const NAV_ITEMS: {
  href: NavRoute;
  label: string;
  matchPrefixes: string[];
  icon: typeof Home;
}[] = [
  { href: "/dashboard", label: "Home", matchPrefixes: ["/dashboard", "/"], icon: Home },
  { href: "/oras", label: "Oras", matchPrefixes: ["/oras"], icon: Clock },
  { href: "/me/leads", label: "Leads", matchPrefixes: ["/me/leads", "/leads"], icon: Users },
  { href: "/request", label: "Request", matchPrefixes: ["/request"], icon: FilePenLine },
  { href: "/more", label: "More", matchPrefixes: ["/more"], icon: MoreHorizontal },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, liveMessage, signInDemo, resetDemoData } = useInternApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoNoticeOpen, setDemoNoticeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeHref = useMemo(() => {
    if (pathname === "/") return "/dashboard";
    const found = NAV_ITEMS.find((item) =>
      item.matchPrefixes.some((p) => p !== "/" && pathname.startsWith(p))
    );
    return found?.href ?? "/dashboard";
  }, [pathname]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const pages = NAV_ITEMS.map((n) => ({
      id: `page-${n.href}`,
      group: "Screens",
      title: n.label,
      subtitle: n.href,
      href: n.href,
    }));

    const tasks = [
      {
        id: "cleaning-duty-today",
        group: "Paglilinis",
        title: "Paglilinis · 4:30 PM Output",
        subtitle: "Ikaw ang nakatask ngayon sa paglilinis — attach o take a picture ng output.",
        href: "/dashboard#paglilinis",
      },
    ];

    const knowledge = MORE_KNOWLEDGE_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({
        id: `kb-${item.id}`,
        group: cat.label,
        title: item.title,
        subtitle: item.subtitle,
        href: `/more?q=${encodeURIComponent(item.title)}`,
      }))
    );

    const leads = state.leads.map((lead) => ({
      id: `lead-${lead.id}`,
      group: "My leads",
      title: lead.businessName,
      subtitle: `${lead.product} · ${lead.status}`,
      href: "/me/leads",
    }));

    const all = [...pages, ...tasks, ...knowledge, ...leads];
    if (!q) return all.slice(0, 8);
    return all.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.group.toLowerCase().includes(q)
    );
  }, [searchQuery, state.leads]);

  if (!state.signedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-canvas)] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-xl">
          <div className="mb-6">
            <p className="text-3xl font-extrabold tracking-tight">
              <span className="text-[var(--text-primary)]">ash</span>
              <span className="text-[var(--accent-teal)]">ai</span>
            </p>
            <p className="mt-1 text-xs font-semibold tracking-[0.22em] text-[var(--text-muted)] uppercase">
              Apparel Smart Hub
            </p>
          </div>

          <div className="mb-5 rounded-xl border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] p-3.5 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--accent-teal)]">
              Demo Session Signed Out
            </p>
            <p className="mt-1">
              This prototype uses local browser demo state only. No production
              credentials or live Ashai backend APIs are connected.
            </p>
          </div>

          <button
            type="button"
            onClick={signInDemo}
            className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-3 text-base font-bold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
          >
            Continue as Demo Intern ({state.profile.fullName})
          </button>

          <button
            type="button"
            onClick={() => {
              resetDemoData();
              signInDemo();
            }}
            className="ashai-tap-target mt-3 w-full rounded-xl border border-[var(--border-control)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          >
            Reset demo data &amp; sign in
          </button>

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            {APP_BUILD_TAG} · Demo UI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] md:grid md:grid-cols-[15.5rem_1fr]">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      {/* Desktop Left Sidebar + Mobile Top Header share one clean navigation landmark */}
      <aside className="hidden border-r border-[var(--border-subtle)] bg-[var(--bg-header)] md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:justify-between md:px-4 md:py-5">
        <div>
          <Link href="/dashboard" className="block rounded-xl px-2 py-1">
            <span className="block text-[1.7rem] font-extrabold leading-none tracking-tight">
              <span className="text-[var(--text-primary)]">ash</span>
              <span className="text-[var(--accent-teal)]">ai</span>
            </span>
            <span className="mt-1.5 block text-[0.65rem] font-semibold tracking-[0.22em] text-[var(--text-muted)] uppercase">
              Apparel Smart Hub
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setDemoNoticeOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-teal)] hover:bg-[rgba(77,196,178,0.22)]"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Demo mode · Local state
          </button>

          <nav aria-label="Primary" className="mt-6">
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`nav-item relative flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[var(--accent-teal-soft)] text-[var(--accent-teal)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[var(--accent-teal)]"
                        />
                      ) : null}
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ashai-tap-target flex w-full items-center gap-2.5 rounded-xl border border-[var(--border-control)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent-teal)] hover:text-[var(--text-primary)]"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span>Quick search</span>
          </button>
          <p className="px-2 text-xs text-[var(--text-muted)]">
            {state.profile.fullName} · {state.profile.roleLabel}
          </p>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-col">
        {/* Sticky Mobile/Compact Header (matches all 16 screenshots) */}
        <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-header)]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" className="block rounded-lg">
                <span className="block text-[1.65rem] font-extrabold leading-none tracking-tight">
                  <span className="text-[var(--text-primary)]">ash</span>
                  <span className="text-[var(--accent-teal)]">ai</span>
                </span>
                <span className="mt-1 block text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--text-muted)] uppercase">
                  Apparel Smart Hub
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setDemoNoticeOpen(true)}
                className="rounded-full border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide text-[var(--accent-teal)] uppercase"
              >
                Demo
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Ashai screens, tasks, and guides"
              className="ashai-tap-target -mr-2 inline-flex items-center justify-center rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            >
              <Search className="size-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Subtle Desktop Top Utility Strip */}
        <header className="hidden border-b border-[var(--border-subtle)] bg-[var(--bg-header)]/80 px-6 py-3 md:flex md:items-center md:justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Intern workspace · Responsive mobile-first rebuild (Demo data)
          </p>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 text-sm text-[var(--text-secondary)] hover:border-[var(--border-control)] hover:text-[var(--text-primary)]"
          >
            <Search className="size-4" aria-hidden="true" />
            <span>Search tasks, leads, or guides</span>
          </button>
        </header>

        {/* Visible Status Toast */}
        {liveMessage ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+1rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 md:bottom-6">
            <div className="rounded-full border border-[var(--border-teal)] bg-[var(--bg-card)] px-4 py-2 text-xs font-semibold text-[var(--accent-teal)] shadow-lg">
              {liveMessage}
            </div>
          </div>
        ) : null}

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-[calc(var(--bottom-nav-height)+2.25rem+env(safe-area-inset-bottom))] md:max-w-3xl md:px-8 md:py-7"
        >
          {children}
        </main>
      </div>

      {/* Fixed Bottom Navigation on Mobile (< 768px) */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border-subtle)] bg-[var(--bg-header)]/98 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-item relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 text-[0.72rem] font-semibold transition ${
                    isActive
                      ? "text-[var(--accent-teal)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`nav-indicator absolute top-0 h-[3px] w-9 rounded-b-full bg-[var(--accent-teal)] transition-all duration-150 ${
                      isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    }`}
                  />
                  <Icon className="size-[1.35rem] shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Global Search Modal (triggered from header Search button) */}
      <AccessibleModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        titleId="global-search-title"
        title="Search Ashai"
        subtitle="Jump to intern screens, work tools, knowledge items, or saved demo leads."
      >
        <search>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const first = searchResults[0];
              if (first) {
                setSearchOpen(false);
                router.push(first.href);
              }
            }}
          >
            <label
              htmlFor="global-search-input"
              className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]"
            >
              Keyword
            </label>
            <input
              id="global-search-input"
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Paglilinis, Oras, Leave, Leads..."
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="ashai-control"
            />
          </form>
        </search>

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {searchResults.length === 0 ? (
            <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-4 py-3 text-sm text-[var(--text-muted)]">
              No matching screens, tasks, or demo leads found.
            </p>
          ) : (
            searchResults.map((res) => (
              <Link
                key={res.id}
                href={res.href}
                onClick={() => setSearchOpen(false)}
                className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-3.5 py-2.5 transition hover:border-[var(--border-teal)] hover:bg-[var(--bg-card-hover)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {res.title}
                  </span>
                  <span className="shrink-0 rounded-md bg-[var(--bg-pill)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--accent-teal)]">
                    {res.group}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                  {res.subtitle}
                </p>
              </Link>
            ))
          )}
        </div>
      </AccessibleModal>

      {/* Demo Data Boundary Notice Modal */}
      <AccessibleModal
        open={demoNoticeOpen}
        onClose={() => setDemoNoticeOpen(false)}
        titleId="demo-notice-title"
        title="Demo Mode Notice"
        subtitle="Transparent separation from production Ashai APIs & company policies"
      >
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p>
            This workspace was scaffolded solely from the mobile UI screenshots
            in <code className="rounded bg-[var(--bg-pill)] px-1.5 py-0.5 text-xs">internUI/</code>.
            No backend APIs, production authentication, or internal company
            databases exist in this repository.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-[var(--text-muted)]">
            <li>
              Time-in/out logs, daily accomplishments, requests, leads, and
              label progress are saved locally in your browser via{" "}
              <code className="text-[var(--text-secondary)]">localStorage</code>.
            </li>
            <li>
              Role-specific assignments (like Stock Count, Stickers, or Leads)
              reflect only the single intern account shown in the screenshots.
            </li>
            <li>
              Approval routing (e.g., Leave approvals or cut-off rules) and
              working-hour calculation notices follow visible screenshot copy for
              UI fidelity only.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                setDemoNoticeOpen(false);
              }}
              className="ashai-tap-target rounded-xl border border-[var(--border-control)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            >
              Reset demo data
            </button>
            <button
              type="button"
              onClick={() => setDemoNoticeOpen(false)}
              className="ashai-tap-target rounded-xl bg-[var(--accent-teal)] px-4 py-2 text-sm font-bold text-[var(--accent-teal-ink)] hover:bg-[var(--accent-teal-hover)]"
            >
              Got it
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}
