"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  FilePenLine,
  Home,
  MoreHorizontal,
  Power,
  Search,
  Users,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import { APP_BUILD_TAG, MORE_KNOWLEDGE_CATEGORIES } from "@/data/demoData";
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
  const {
    state,
    liveMessage,
    signInWithCredentials,
    signOut,
    advanceCleaningDay,
    resetDemoData,
  } = useInternApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [demoNoticeOpen, setDemoNoticeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [prepareOpen, setPrepareOpen] = useState(true);
  const [stockBuyingOpen, setStockBuyingOpen] = useState(true);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const pendingLabelsCount = useMemo(
    () =>
      state.labelJobs
        .filter((job) => !job.done)
        .reduce((sum, job) => sum + job.quantity, 0),
    [state.labelJobs]
  );

  const sidebarFilter = sidebarQuery.trim().toLowerCase();
  const desktopPrimaryLinks = [
    { href: "/dashboard" as NavRoute, label: "Home" },
    { href: "/oras" as NavRoute, label: "Oras at reports" },
    { href: "/me/leads" as NavRoute, label: "Leads" },
    { href: "/request" as NavRoute, label: "Request" },
    { href: "/more" as NavRoute, label: "Profile" },
  ].filter(
    (item) => !sidebarFilter || item.label.toLowerCase().includes(sidebarFilter)
  );

  const prepareLinks = [
    {
      href: "/more?q=Labels",
      label: "Labels",
      badge: pendingLabelsCount,
    },
  ].filter(
    (item) =>
      !sidebarFilter ||
      item.label.toLowerCase().includes(sidebarFilter) ||
      "prepare".includes(sidebarFilter)
  );

  const stockBuyingLinks = [
    { href: "/more?q=Stock%20Count", label: "Stock Count" },
    { href: "/more?q=Stock%20Count", label: "Stock Count Settings" },
  ].filter(
    (item) =>
      !sidebarFilter ||
      item.label.toLowerCase().includes(sidebarFilter) ||
      "stock & buying".includes(sidebarFilter)
  );

  const allSidebarExpanded = prepareOpen && stockBuyingOpen;

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
        subtitle: "Ikaw ang nakatask ngayon sa paglilinis — kumuha ng picture ng output.",
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
    const handleSignInSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const res = signInWithCredentials(loginUsername, loginPassword);
      if (!res.ok) {
        setLoginError(res.error ?? "Mali ang username o password.");
        return;
      }
      setLoginError(null);
      setLoginPassword("");
      setForgotOpen(false);
      router.push("/dashboard");
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

          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-username"
                className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
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
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  if (loginError) setLoginError(null);
                }}
                className="w-full rounded-lg border border-[#1f2626] bg-[#040707] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] hover:border-[#2e3a3a] focus:border-[var(--accent-teal)]"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  className="w-full rounded-lg border border-[#1f2626] bg-[#040707] py-2.5 pr-11 pl-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] hover:border-[#2e3a3a] focus:border-[var(--accent-teal)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="size-4.5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {loginError ? (
              <p
                role="alert"
                className="rounded-lg border border-[var(--accent-danger)]/40 bg-[var(--accent-danger-soft)] px-3 py-2 text-xs font-medium text-[var(--accent-danger)]"
              >
                {loginError}
              </p>
            ) : null}

            <button
              type="submit"
              className="ashai-tap-target mt-1 w-full rounded-lg bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[#041412] transition hover:bg-[var(--accent-teal-hover)]"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 border-t border-[#161c1c] pt-4 text-center">
            <button
              type="button"
              onClick={() => setForgotOpen((prev) => !prev)}
              className="text-sm font-medium text-[var(--accent-teal)] transition hover:text-[var(--accent-teal-hover)]"
            >
              Nakalimutan ang password?
            </button>
            {forgotOpen ? (
              <p className="mt-2.5 rounded-lg border border-[#1b2424] bg-[#090d0d] px-3 py-2 text-xs leading-relaxed text-[var(--text-muted)]">
                Makipag-ugnayan sa iyong admin para ma-reset ang password ng
                account mo. (Demo UI — local accounts only.)
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] md:grid md:grid-cols-[15.5rem_1fr]">
      <a href="#main-content" className="skip-link visually-hidden">
        Skip to main content
      </a>

      {/* Desktop Left Sidebar */}
      <aside className="hidden border-r border-[var(--border-subtle)] bg-[var(--bg-header)] md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:justify-between md:px-4 md:py-4">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              aria-label="Ashai Apparel Smart Hub Home"
              className="inline-flex items-center rounded-xl px-1 py-0.5"
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
              title="Demo mode info"
              className="rounded-full border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-[var(--accent-teal)] uppercase hover:bg-[rgba(77,196,178,0.22)]"
            >
              Demo
            </button>
          </div>

          {/* Sidebar Search */}
          <div className="relative mt-3.5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={sidebarQuery}
              onChange={(e) => setSidebarQuery(e.target.value)}
              placeholder="Search (e.g. mass cut)"
              aria-label="Search sidebar menu"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 pr-3 pl-9 text-xs text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent-teal)]"
            />
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const next = !allSidebarExpanded;
                setPrepareOpen(next);
                setStockBuyingOpen(next);
              }}
              className="text-[0.72rem] font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent-teal)]"
            >
              {allSidebarExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <nav
            aria-label="Primary"
            className="mt-2 min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5"
          >
            {/* Primary Links */}
            <ul className="space-y-1">
              {desktopPrimaryLinks.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`nav-item flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                        isActive
                          ? "bg-[var(--accent-teal-soft)] font-bold text-[var(--accent-teal)]"
                          : "font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full ${
                          isActive
                            ? "bg-[var(--accent-teal)]"
                            : "bg-[var(--text-muted)]/60"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* PREPARE Section */}
            {prepareLinks.length > 0 ? (
              <div>
                <button
                  type="button"
                  aria-expanded={prepareOpen}
                  onClick={() => setPrepareOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase transition hover:text-[var(--text-primary)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList
                      className="size-3.5 text-[var(--accent-teal)]"
                      aria-hidden="true"
                    />
                    <span>Prepare</span>
                  </span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${
                      prepareOpen ? "rotate-0" : "-rotate-90"
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {prepareOpen ? (
                  <ul className="mt-1 space-y-1">
                    {prepareLinks.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex min-h-9 items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                        >
                          <span className="inline-flex items-center gap-3 truncate">
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full bg-[var(--accent-teal)]"
                            />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <span className="rounded-full bg-[var(--bg-pill)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--text-secondary)]">
                            {item.badge}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {/* STOCK & BUYING Section */}
            {stockBuyingLinks.length > 0 ? (
              <div>
                <button
                  type="button"
                  aria-expanded={stockBuyingOpen}
                  onClick={() => setStockBuyingOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-[var(--text-muted)] uppercase transition hover:text-[var(--text-primary)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Box
                      className="size-3.5 text-[var(--accent-teal)]"
                      aria-hidden="true"
                    />
                    <span>Stock &amp; Buying</span>
                  </span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${
                      stockBuyingOpen ? "rotate-0" : "-rotate-90"
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {stockBuyingOpen ? (
                  <ul className="mt-1 space-y-1">
                    {stockBuyingLinks.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="flex min-h-9 items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-[var(--text-muted)]/60"
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>

        <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex items-center justify-between gap-2.5 px-1 pt-0.5">
            <div className="flex min-w-0 items-center gap-2.5">
              {state.profile.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={state.profile.avatarDataUrl}
                  alt={`${state.profile.fullName} avatar`}
                  className="size-9 shrink-0 rounded-full border border-[var(--border-teal)] object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-pill)] text-xs font-extrabold text-[var(--text-primary)]"
                >
                  {state.profile.initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-[var(--text-primary)]">
                  {state.profile.fullName}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {state.profile.roleLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--accent-danger-soft)] hover:text-[var(--accent-danger)]"
            >
              <Power className="size-4.5" aria-hidden="true" />
            </button>
          </div>

          <p className="text-center text-[0.7rem] text-[var(--text-muted)]">
            {APP_BUILD_TAG}
          </p>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-col">
        {/* Sticky Mobile/Compact Header (matches all 16 screenshots) */}
        <header className="sticky top-0 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-header)]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
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
        <header className="hidden border-b border-[var(--border-subtle)] bg-[var(--bg-header)]/80 px-6 py-2 md:flex md:items-center md:justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Intern workspace
          </p>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 text-xs text-[var(--text-secondary)] hover:border-[var(--border-control)] hover:text-[var(--text-primary)]"
          >
            <Search className="size-3.5" aria-hidden="true" />
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
          className="mx-auto w-full max-w-2xl flex-1 px-4 pt-5 pb-[calc(var(--bottom-nav-height)+2.25rem+env(safe-area-inset-bottom))] md:max-w-4xl md:px-8 md:py-4"
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
