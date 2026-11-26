"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeftToLine,
  ArrowRightFromLine,
  Box,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  FilePenLine,
  Home,
  LogOut,
  Moon,
  MoreHorizontal,
  Search,
  Sun,
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
  const [prepareOpen, setPrepareOpen] = useState(true);
  const [stockBuyingOpen, setStockBuyingOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const userMenuDesktopRef = useRef<HTMLDivElement>(null);
  const userMenuMobileRef = useRef<HTMLDivElement>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const isLight = theme === "light";

  useEffect(() => {
    if (!userMenuOpen && !desktopSearchOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuOpen) {
        const inDesktop = userMenuDesktopRef.current?.contains(target);
        const inMobile = userMenuMobileRef.current?.contains(target);
        if (!inDesktop && !inMobile) {
          setUserMenuOpen(false);
        }
      }
      if (
        desktopSearchOpen &&
        !desktopSearchRef.current?.contains(target)
      ) {
        setDesktopSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setDesktopSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen, desktopSearchOpen]);

  const pendingLabelsCount = useMemo(
    () =>
      state.labelJobs
        .filter((job) => !job.done)
        .reduce((sum, job) => sum + job.quantity, 0),
    [state.labelJobs]
  );

  const desktopPrimaryLinks = [
    { href: "/oras" as NavRoute, label: "Oras at reports" },
    { href: "/me/leads" as NavRoute, label: "Leads" },
    { href: "/request" as NavRoute, label: "Request" },
    { href: "/more" as NavRoute, label: "Profile" },
  ];

  const prepareLinks = [
    {
      href: "/more?q=Labels",
      label: "Labels",
      badge: pendingLabelsCount,
    },
  ];

  const stockBuyingLinks = [
    { href: "/more?q=Stock%20Count", label: "Stock Count" },
    { href: "/more?q=Stock%20Count", label: "Stock Count Settings" },
  ];

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

      {/* Desktop Left Sidebar (Inverts cleanly between Dark Mode mint-sage & Light Mode dark-teal) */}
      <aside
        className={`hidden border-r md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:justify-between ${
          isLight
            ? "border-[#192b28] bg-[#0d1c1a] text-[#e7f0ee]"
            : "border-[#bfd4ce] bg-[#d9e8e4] text-[#1f2e2b]"
        }`}
      >
        {sidebarCollapsed ? (
          <div className="flex h-full flex-col items-center justify-between py-4">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className={`inline-flex size-10 items-center justify-center rounded-xl transition ${
                isLight
                  ? "text-[#8ea8a3] hover:bg-[#17302c] hover:text-white"
                  : "text-[#4f6560] hover:bg-[#c6dad5] hover:text-[#07100e]"
              }`}
            >
              <ArrowRightFromLine className="size-5" aria-hidden="true" />
            </button>

            <nav aria-label="Primary collapsed" className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex size-10 items-center justify-center rounded-xl transition ${
                      isActive
                        ? isLight
                          ? "bg-[#17332e] text-[#4dc4b2]"
                          : "bg-[#bdd3cd] text-[#0e7c6b]"
                        : isLight
                          ? "text-[#8ea8a3] hover:bg-[#17302c] hover:text-white"
                          : "text-[#4f6560] hover:bg-[#c6dad5] hover:text-[#07100e]"
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </Link>
                );
              })}
            </nav>

            <span className="h-4" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col px-4 pt-4 pb-3">
              {/* Top Logo + Collapse Sidebar Arrow */}
              <div className="flex items-start justify-between gap-2">
                <Link
                  href="/dashboard"
                  aria-label="Ashai Apparel Smart Hub Home"
                  className="block rounded-lg px-0.5 py-0.5"
                >
                  {isLight ? (
                    <Image
                      src="/ashai-logo.png"
                      alt="Ashai Apparel Smart Hub"
                      width={172}
                      height={43}
                      priority
                      className="block h-10 w-auto select-none"
                    />
                  ) : (
                    <>
                      <span className="block text-[1.85rem] font-black leading-none tracking-[-0.03em]">
                        <span className="text-[#07100e]">ash</span>
                        <span className="text-[#0e7c6b]">ai</span>
                      </span>
                      <span className="mt-1.5 block text-[0.62rem] font-semibold tracking-[0.22em] text-[#5d736e] uppercase">
                        Apparel Smart Hub
                      </span>
                    </>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className={`mt-1 inline-flex size-8 items-center justify-center rounded-lg transition ${
                    isLight
                      ? "text-[#7c9792] hover:bg-[#17302c] hover:text-white"
                      : "text-[#5a726c] hover:bg-[#c6dad5] hover:text-[#07100e]"
                  }`}
                >
                  <ArrowLeftToLine className="size-4.5" aria-hidden="true" />
                </button>
              </div>

              {/* Collapse all / Expand all */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const next = !allSidebarExpanded;
                    setPrepareOpen(next);
                    setStockBuyingOpen(next);
                  }}
                  className={`text-xs font-semibold transition ${
                    isLight
                      ? "text-[#7d9893] hover:text-[#4dc4b2]"
                      : "text-[#5d746f] hover:text-[#0e7c6b]"
                  }`}
                >
                  {allSidebarExpanded ? "Collapse all" : "Expand all"}
                </button>
              </div>

              {/* Nav Items + Prepare + Stock & Buying */}
              <nav
                aria-label="Primary"
                className="mt-2 min-h-0 flex-1 space-y-5 overflow-y-auto pr-0.5"
              >
                <ul className="space-y-1">
                  {desktopPrimaryLinks.map((item) => {
                    const isActive = activeHref === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={`nav-item flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2 text-[0.95rem] transition ${
                            isActive
                              ? isLight
                                ? "bg-[#17322d] font-bold text-[#f4faf9]"
                                : "bg-[#bdd3cd] font-bold text-[#07100e]"
                              : isLight
                                ? "font-semibold text-[#9eb5b0] hover:bg-[#142a26] hover:text-white"
                                : "font-semibold text-[#2b3b37] hover:bg-[#cae0da] hover:text-[#07100e]"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`size-1.5 shrink-0 rounded-full ${
                              isActive
                                ? isLight
                                  ? "bg-[#4dc4b2]"
                                  : "bg-[#0e7c6b]"
                                : isLight
                                  ? "bg-[#45635d]"
                                  : "bg-[#a3bab4]"
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
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.72rem] font-bold tracking-[0.12em] uppercase transition ${
                        isLight
                          ? "text-[#7a948f] hover:text-white"
                          : "text-[#4f6560] hover:text-[#07100e]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <ClipboardList
                          className={`size-4 ${
                            isLight ? "text-[#4dc4b2]" : "text-[#0e7c6b]"
                          }`}
                          aria-hidden="true"
                        />
                        <span>Prepare</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-[0.65rem] ${
                          isLight ? "text-[#7a948f]" : "text-[#5a726c]"
                        }`}
                      >
                        {prepareOpen ? "▾" : "▸"}
                      </span>
                    </button>
                    {prepareOpen ? (
                      <ul className="mt-1.5 space-y-1">
                        {prepareLinks.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className={`flex min-h-10 items-center justify-between gap-2 rounded-xl px-3.5 py-1.5 text-[0.95rem] font-semibold transition ${
                                isLight
                                  ? "text-[#9eb5b0] hover:bg-[#142a26] hover:text-white"
                                  : "text-[#2b3b37] hover:bg-[#cae0da] hover:text-[#07100e]"
                              }`}
                            >
                              <span className="inline-flex items-center gap-3 truncate">
                                <span
                                  aria-hidden="true"
                                  className={`size-1.5 shrink-0 rounded-full ${
                                    isLight ? "bg-[#4dc4b2]" : "bg-[#16917d]"
                                  }`}
                                />
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isLight
                                    ? "bg-[#1a3430] text-[#b4cbc6]"
                                    : "bg-[#c3d7d2] text-[#2b3b37]"
                                }`}
                              >
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
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[0.72rem] font-bold tracking-[0.12em] uppercase transition ${
                        isLight
                          ? "text-[#7a948f] hover:text-white"
                          : "text-[#4f6560] hover:text-[#07100e]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <Box
                          className={`size-4 ${
                            isLight ? "text-[#4dc4b2]" : "text-[#0e7c6b]"
                          }`}
                          aria-hidden="true"
                        />
                        <span>Stock &amp; Buying</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-[0.65rem] ${
                          isLight ? "text-[#7a948f]" : "text-[#5a726c]"
                        }`}
                      >
                        {stockBuyingOpen ? "▾" : "▸"}
                      </span>
                    </button>
                    {stockBuyingOpen ? (
                      <ul className="mt-1.5 space-y-1">
                        {stockBuyingLinks.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className={`flex min-h-10 items-center gap-3 rounded-xl px-3.5 py-1.5 text-[0.95rem] font-semibold transition ${
                                isLight
                                  ? "text-[#9eb5b0] hover:bg-[#142a26] hover:text-white"
                                  : "text-[#2b3b37] hover:bg-[#cae0da] hover:text-[#07100e]"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`size-1.5 shrink-0 rounded-full ${
                                  isLight ? "bg-[#45635d]" : "bg-[#a3bab4]"
                                }`}
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

            {/* Subtle build tag only (Name, Intern, and Logout moved to upper-right menu) */}
            <div
              className={`border-t px-4 py-2.5 ${
                isLight ? "border-[#192b28]" : "border-[#c2d6d0]"
              }`}
            >
              <p
                className={`text-center text-[0.7rem] font-medium ${
                  isLight ? "text-[#607a75]" : "text-[#6c827d]"
                }`}
              >
                {APP_BUILD_TAG}
              </p>
            </div>
          </>
        )}
      </aside>

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

              {/* Mobile Upper-Right Clickable Account Menu */}
              <div ref={userMenuMobileRef} className="relative">
                <button
                  type="button"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Account menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2 pl-1 text-xs font-bold text-white transition hover:bg-white/15"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#4dc4b2] text-[0.7rem] font-extrabold text-[#041b18]">
                    {state.profile.initials}
                  </span>
                  <ChevronDown className="size-3.5 text-[#c1cccc]" aria-hidden="true" />
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-2xl"
                  >
                    <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {state.profile.fullName}
                      </p>
                      <p className="text-xs font-semibold text-[var(--accent-teal)]">
                        {state.profile.roleLabel}
                      </p>
                    </div>
                    <div className="mt-1 space-y-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          toggleTheme();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
                      >
                        {isLight ? (
                          <>
                            <Moon className="size-4 text-[var(--accent-teal)]" aria-hidden="true" />
                            <span>Dark mode</span>
                          </>
                        ) : (
                          <>
                            <Sun className="size-4 text-[var(--accent-teal)]" aria-hidden="true" />
                            <span>Light mode</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
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
            </div>
          </div>
        </header>

        {/* Desktop Top Utility Bar (Inverts with Light/Dark mode + Upper-Right Clickable Profile Menu) */}
        <header
          className={`sticky top-0 z-30 hidden border-b px-6 py-2.5 md:flex md:items-center md:justify-between ${
            isLight
              ? "border-[#1c2927] bg-[#0e1514] text-[#f3f6f6]"
              : "border-[#dde5e3] bg-[#f4f6f5] text-[#0b1412]"
          }`}
        >
          {/* Inline Search Input with Anchored Dropdown (no modal overlay) */}
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

            {/* Upper-Right Clickable Account Pill (Intern, Light/Dark mode, Logout) */}
            <div ref={userMenuDesktopRef} className="relative">
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1.5 text-xs font-bold transition ${
                  isLight
                    ? "bg-[#182221] text-[#f3f6f6] hover:bg-[#22302e]"
                    : "bg-[#e5ecea] text-[#0b1412] hover:bg-[#d8e3e0]"
                }`}
              >
                {state.profile.avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={state.profile.avatarDataUrl}
                    alt={`${state.profile.fullName} avatar`}
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
                    {state.profile.initials}
                  </span>
                )}
                <span className="max-w-36 truncate">
                  {state.profile.fullName}
                </span>
                <ChevronDown
                  className={`size-3.5 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {userMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 shadow-2xl"
                >
                  <div className="border-b border-[var(--border-subtle)] px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {state.profile.fullName}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[var(--accent-teal)]">
                      {state.profile.roleLabel}
                    </p>
                  </div>

                  <div className="mt-1.5 space-y-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        toggleTheme();
                        setUserMenuOpen(false);
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
                        setUserMenuOpen(false);
                        signOut();
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
