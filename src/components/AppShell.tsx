"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Clock,
  FilePenLine,
  Home,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { DesktopSidebar } from "@/components/shell/DesktopSidebar";
import { SignInScreen } from "@/components/shell/SignInScreen";
import { UserAccountMenu } from "@/components/shell/UserAccountMenu";
import { useInternApp } from "@/context/InternAppContext";
import { MORE_KNOWLEDGE_CATEGORIES } from "@/data/demoData";
import type { NavRoute } from "@/types/intern";

const MOBILE_NAV_ITEMS: {
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

const DESKTOP_COLLAPSED_NAV_ITEMS = MOBILE_NAV_ITEMS.filter(
  (item) => item.href !== "/dashboard"
);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state,
    theme,
    toggleTheme,
    liveMessage,
    signInWithCredentials,
    signOut,
    advanceCleaningDay,
    resetDemoData,
  } = useInternApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [demoNoticeOpen, setDemoNoticeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const isLight = theme === "light";

  // Desktop view has no Home tab: redirect /dashboard to /oras on desktop viewports (>= 768px)
  useEffect(() => {
    if (!state.signedIn || pathname !== "/dashboard") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const syncDesktopRoute = () => {
      if (mq.matches) {
        router.replace("/oras");
      }
    };
    syncDesktopRoute();
    mq.addEventListener("change", syncDesktopRoute);
    return () => mq.removeEventListener("change", syncDesktopRoute);
  }, [state.signedIn, pathname, router]);

  useEffect(() => {
    if (!desktopSearchOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (!desktopSearchRef.current?.contains(e.target as Node)) {
        setDesktopSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesktopSearchOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopSearchOpen]);

  const pendingLabelsCount = useMemo(
    () =>
      state.labelJobs
        .filter((job) => !job.done)
        .reduce((sum, job) => sum + job.quantity, 0),
    [state.labelJobs]
  );

  const activeHref = useMemo<NavRoute>(() => {
    if (pathname === "/") return "/dashboard";
    const found = MOBILE_NAV_ITEMS.find((item) =>
      item.matchPrefixes.some((p) => p !== "/" && pathname.startsWith(p))
    );
    return found?.href ?? "/dashboard";
  }, [pathname]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const pages = MOBILE_NAV_ITEMS.map((n) => ({
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
        subtitle:
          "Ikaw ang nakatask ngayon sa paglilinis — kumuha ng picture ng output.",
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
      <SignInScreen
        onSignIn={signInWithCredentials}
        onSuccess={() => {
          const isDesktop =
            typeof window !== "undefined" &&
            window.matchMedia("(min-width: 768px)").matches;
          router.push(isDesktop ? "/oras" : "/dashboard");
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] md:grid ${
        sidebarCollapsed
          ? "md:grid-cols-[4rem_1fr]"
          : "md:grid-cols-[16.5rem_1fr]"
      }`}
    >
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      <DesktopSidebar
        isLight={isLight}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
        activeHref={activeHref}
        pendingLabelsCount={pendingLabelsCount}
        collapsedNavItems={DESKTOP_COLLAPSED_NAV_ITEMS}
      />

      {/* Main Column */}
      <div className="flex min-w-0 flex-col">
        {/* Sticky Mobile/Compact Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-header)]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link
                href="/dashboard"
                aria-label="Ashai Apparel Smart Hub Home"
                className="inline-flex shrink-0 items-center rounded-lg py-0.5"
              >
                <Image
                  src="/ashai-logo.png"
                  alt="Ashai Apparel Smart Hub"
                  width={172}
                  height={43}
                  priority
                  className="block h-9 w-auto select-none"
                />
              </Link>
              <button
                type="button"
                onClick={() => setDemoNoticeOpen(true)}
                className="rounded-full border border-[#2e8477] bg-[rgba(77,196,178,0.14)] px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide text-[#4dc4b2] uppercase"
              >
                Demo
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Ashai screens, tasks, and guides"
                className="inline-flex size-10 items-center justify-center rounded-xl text-[#f3f6f6] hover:bg-white/10"
              >
                <Search className="size-5" aria-hidden="true" />
              </button>

              <UserAccountMenu
                profile={state.profile}
                isLight={isLight}
                variant="mobile"
                onToggleTheme={toggleTheme}
                onSignOut={signOut}
              />
            </div>
          </div>
        </header>

        {/* Desktop Top Utility Bar */}
        <header
          className={`sticky top-0 z-30 hidden border-b px-6 py-2.5 md:flex md:items-center md:justify-between ${
            isLight
              ? "border-[#1c2927] bg-[#0e1514] text-[#f3f6f6]"
              : "border-[#dde5e3] bg-[#f4f6f5] text-[#0b1412]"
          }`}
        >
          {/* Inline Search Input with Anchored Dropdown */}
          <div ref={desktopSearchRef} className="relative w-80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const first = searchResults[0];
                if (first) {
                  setDesktopSearchOpen(false);
                  router.push(first.href);
                }
              }}
            >
              <Search
                className={`pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 ${
                  isLight ? "text-[#8fa39f]" : "text-[#5c6d6a]"
                }`}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setDesktopSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDesktopSearchOpen(true);
                }}
                placeholder="Search orders, clients, pages..."
                aria-label="Search orders, clients, pages"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={`min-h-9 w-full rounded-xl py-1.5 pr-3 pl-9 text-xs font-medium outline-none transition ${
                  isLight
                    ? "bg-[#182221] text-white placeholder:text-[#8fa39f] focus:ring-1 focus:ring-[#4dc4b2]"
                    : "bg-[#e5eae8] text-[#0b1412] placeholder:text-[#5c6d6a] focus:ring-1 focus:ring-[#0e7c6b]"
                }`}
              />
            </form>

            {desktopSearchOpen && searchQuery.trim().length > 0 ? (
              <div className="absolute top-full left-0 z-40 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
                <p className="border-b border-[var(--border-subtle)] px-3.5 py-2 text-[0.7rem] text-[var(--text-muted)]">
                  {searchResults.length} resulta para sa &ldquo;{searchQuery.trim()}&rdquo;
                </p>
                <div className="max-h-72 divide-y divide-[var(--border-subtle)] overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <p className="px-3.5 py-3 text-xs text-[var(--text-muted)]">
                      Walang nakitang resulta.
                    </p>
                  ) : (
                    searchResults.slice(0, 8).map((res) => {
                      const badge =
                        res.group === "Screens"
                          ? "PAGE"
                          : res.group === "My leads"
                            ? "LEAD"
                            : res.group === "Paglilinis"
                              ? "TASK"
                              : "GUIDE";
                      return (
                        <Link
                          key={res.id}
                          href={res.href}
                          onClick={() => {
                            setDesktopSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs transition hover:bg-[var(--bg-card-hover)]"
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span className="shrink-0 rounded bg-[var(--accent-teal-soft)] px-1.5 py-0.5 text-[0.62rem] font-extrabold tracking-wide text-[var(--accent-teal)]">
                              {badge}
                            </span>
                            <span className="truncate font-semibold text-[var(--text-primary)]">
                              {res.title}
                            </span>
                          </span>
                          <span className="shrink-0 text-[0.7rem] text-[var(--text-muted)]">
                            {res.group}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setDemoNoticeOpen(true)}
              className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-bold tracking-wide uppercase transition ${
                isLight
                  ? "border-[#2e8477] bg-[rgba(77,196,178,0.14)] text-[#4dc4b2] hover:bg-[rgba(77,196,178,0.22)]"
                  : "border-[#0e7c6b]/30 bg-[#0e7c6b]/10 text-[#0e7c6b] hover:bg-[#0e7c6b]/20"
              }`}
            >
              Demo
            </button>

            <UserAccountMenu
              profile={state.profile}
              isLight={isLight}
              variant="desktop"
              onToggleTheme={toggleTheme}
              onSignOut={signOut}
            />
          </div>
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
          className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-[calc(var(--bottom-nav-height)+2.25rem+env(safe-area-inset-bottom))] md:max-w-6xl md:px-7 md:py-5"
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
          {MOBILE_NAV_ITEMS.map((item) => {
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

      {/* Mobile Global Search Modal */}
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
              placeholder="e.g. Paglilinis, Oras, Leads, Request..."
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
              Role-specific assignments reflect local demo state only.
            </li>
            <li>
              Approval routing and working-hour calculation notices follow
              visible screenshot copy for UI fidelity only.
            </li>
          </ul>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                advanceCleaningDay();
                setDemoNoticeOpen(false);
              }}
              className="ashai-tap-target rounded-xl border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent-teal)] hover:bg-[rgba(77,196,178,0.22)]"
            >
              Simulate Next Day
            </button>
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
