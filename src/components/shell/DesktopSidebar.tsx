"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftToLine,
  ArrowRightFromLine,
  Box,
  ClipboardList,
  Search,
  type LucideIcon,
} from "lucide-react";
import { APP_BUILD_TAG } from "@/data/demoData";
import type { NavRoute } from "@/types/intern";

export interface CollapsedNavItem {
  href: NavRoute;
  label: string;
  icon: LucideIcon;
}

interface DesktopSidebarProps {
  isLight: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeHref: NavRoute;
  pendingLabelsCount: number;
  collapsedNavItems: CollapsedNavItem[];
}

const DESKTOP_PRIMARY_LINKS: { href: NavRoute; label: string }[] = [
  { href: "/oras", label: "Oras at reports" },
  { href: "/me/leads", label: "Leads" },
  { href: "/request", label: "Request" },
  { href: "/more", label: "Profile" },
];

const STOCK_BUYING_LINKS = [
  { href: "/more?q=Stock%20Count", label: "Stock Count" },
  { href: "/more?q=Stock%20Count", label: "Stock Count Settings" },
];

export function DesktopSidebar({
  isLight,
  collapsed,
  onToggleCollapsed,
  activeHref,
  pendingLabelsCount,
  collapsedNavItems,
}: DesktopSidebarProps) {
  const router = useRouter();
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [prepareOpen, setPrepareOpen] = useState(false);
  const [stockBuyingOpen, setStockBuyingOpen] = useState(true);
  const anyExpanded = prepareOpen || stockBuyingOpen;

  return (
    <aside
      className={`hidden border-r md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:justify-between ${
        isLight
          ? "border-[#192b28] bg-[#0d1c1a] text-[#e7f0ee]"
          : "border-[#bfd4ce] bg-[#d9e8e4] text-[#1f2e2b]"
      }`}
    >
      {collapsed ? (
        <div className="flex h-full flex-col items-center justify-between py-4">
          <button
            type="button"
            onClick={onToggleCollapsed}
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
            {collapsedNavItems.map((item) => {
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
                href="/oras"
                aria-label="Ashai Apparel Smart Hub Oras at reports"
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
                onClick={onToggleCollapsed}
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

            {/* Sidebar Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = sidebarSearch.trim();
                router.push(q ? `/more?q=${encodeURIComponent(q)}` : "/more");
              }}
              className="relative mt-4"
            >
              <Search
                className={`pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 ${
                  isLight ? "text-[#7d9893]" : "text-[#637a75]"
                }`}
                aria-hidden="true"
              />
              <input
                type="search"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search (e.g. mass cut)"
                aria-label="Search sidebar (e.g. mass cut)"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={`min-h-10 w-full rounded-xl border py-2 pr-3 pl-10 text-sm font-medium outline-none transition ${
                  isLight
                    ? "border-[#1f3733] bg-[#132623] text-white placeholder:text-[#7d9893] focus:border-[#4dc4b2]"
                    : "border-[#bdd2cc] bg-[#cee0db] text-[#07100e] placeholder:text-[#637a75] focus:border-[#0e7c6b]"
                }`}
              />
            </form>

            {/* Collapse all / Expand all */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const next = !anyExpanded;
                  setPrepareOpen(next);
                  setStockBuyingOpen(next);
                }}
                className={`text-xs font-semibold transition ${
                  isLight
                    ? "text-[#7d9893] hover:text-[#4dc4b2]"
                    : "text-[#5d746f] hover:text-[#0e7c6b]"
                }`}
              >
                {anyExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {/* Nav Items + Prepare + Stock & Buying */}
            <nav
              aria-label="Primary"
              className="mt-2 min-h-0 flex-1 space-y-5 overflow-y-auto pr-0.5"
            >
              <ul className="space-y-1">
                {DESKTOP_PRIMARY_LINKS.map((item) => {
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
                              : "bg-[#c1d6d0] font-bold text-[#07100e]"
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
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold tracking-normal ${
                        isLight
                          ? "bg-[#1a3430] text-[#b4cbc6]"
                          : "bg-[#c3d7d2] text-[#2b3b37]"
                      }`}
                    >
                      {pendingLabelsCount}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`text-[0.65rem] ${
                        isLight ? "text-[#7a948f]" : "text-[#5a726c]"
                      }`}
                    >
                      {prepareOpen ? "▾" : "▸"}
                    </span>
                  </span>
                </button>
                {prepareOpen ? (
                  <ul className="mt-1.5 space-y-1">
                    <li>
                      <Link
                        href="/more?q=Labels"
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
                          <span className="truncate">Labels</span>
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isLight
                              ? "bg-[#1a3430] text-[#b4cbc6]"
                              : "bg-[#c3d7d2] text-[#2b3b37]"
                          }`}
                        >
                          {pendingLabelsCount}
                        </span>
                      </Link>
                    </li>
                  </ul>
                ) : null}
              </div>

              {/* STOCK & BUYING Section */}
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
                    {STOCK_BUYING_LINKS.map((item) => (
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
            </nav>
          </div>

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
  );
}
