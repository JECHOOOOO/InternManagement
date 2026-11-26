"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Camera,
  ChevronRight,
  ClipboardList,
  Play,
  Search,
} from "lucide-react";
import { AccessibleModal } from "@/components/AccessibleModal";
import { useInternApp } from "@/context/InternAppContext";
import { APP_BUILD_TAG, MORE_KNOWLEDGE_CATEGORIES } from "@/data/demoData";
import type { MoreKnowledgeCategory } from "@/types/intern";

type GuideItem = MoreKnowledgeCategory["items"][number];

function MoreContentInner({ initialQuery }: { initialQuery: string }) {
  const {
    state,
    updateAvatarDataUrl,
    toggleNotifications,
    signOut,
    resetDemoData,
  } = useInternApp();

  const [query, setQuery] = useState(initialQuery);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    prepare: false,
    "stock-buying": false,
  });
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const pendingLabelsCount = useMemo(
    () =>
      state.labelJobs
        .filter((job) => !job.done)
        .reduce((sum, job) => sum + job.quantity, 0),
    [state.labelJobs]
  );

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MORE_KNOWLEDGE_CATEGORIES.map((cat) => {
      const matchingItems = !q
        ? cat.items
        : cat.items.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.subtitle.toLowerCase().includes(q) ||
              item.keywords.some((kw) => kw.includes(q))
          );
      return {
        ...cat,
        badgeCount: cat.id === "prepare" ? pendingLabelsCount : cat.badgeCount,
        items: matchingItems,
      };
    }).filter((cat) => !query.trim() || cat.items.length > 0);
  }, [query, pendingLabelsCount]);

  const allExpanded =
    filteredCategories.length > 0 &&
    filteredCategories.every((cat) => Boolean(openCategories[cat.id]));

  const toggleExpandAll = () => {
    const nextValue = !allExpanded;
    const nextState: Record<string, boolean> = {};
    for (const cat of MORE_KNOWLEDGE_CATEGORIES) {
      nextState[cat.id] = nextValue;
    }
    setOpenCategories(nextState);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h1 className="visually-hidden">More menu, guides, and profile</h1>

      {/* Profile Card */}
      <button
        type="button"
        onClick={() => setProfileOpen(true)}
        className="ashai-card flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-left transition hover:bg-[var(--bg-card-hover)]"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="relative shrink-0">
            {state.profile.avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={state.profile.avatarDataUrl}
                alt={`${state.profile.fullName} profile photo`}
                className="size-14 rounded-2xl object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-14 items-center justify-center rounded-2xl bg-[var(--accent-teal)] text-xl font-extrabold text-[var(--accent-teal-ink)]"
              >
                {state.profile.initials.charAt(0)}
              </div>
            )}
            <span
              aria-hidden="true"
              className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-lg border border-[var(--bg-card)] bg-[#e2e8f0] text-[#0f172a] shadow"
            >
              <Camera className="size-3.5" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-[var(--text-primary)]">
              {state.profile.fullName}
            </p>
            <p className="text-sm font-semibold text-[var(--accent-teal)]">
              {state.profile.roleLabel}
            </p>
          </div>
        </div>
        <ChevronRight
          className="size-5 shrink-0 text-[var(--text-muted)]"
          aria-hidden="true"
        />
      </button>

      {/* Search Bar */}
      <search>
        <label htmlFor="more-search" className="visually-hidden">
          Search work categories and SOPs
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            id="more-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search (e.g. mass cut)"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="ashai-control rounded-2xl pl-12"
          />
        </div>
      </search>

      {/* Expand all */}
      <div className="flex justify-end">
        <button
          type="button"
          aria-expanded={allExpanded}
          onClick={toggleExpandAll}
          className="min-h-10 rounded-lg px-2.5 text-sm font-bold text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)]"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {/* Category Accordions (<details> without headings inside <summary> per accessibility guide) */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
            No matching guides found for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          filteredCategories.map((cat) => {
            const isOpen = Boolean(query.trim()) || Boolean(openCategories[cat.id]);
            const Icon = cat.id === "prepare" ? ClipboardList : Box;

            return (
              <details
                key={cat.id}
                open={isOpen}
                onToggle={(e) => {
                  const target = e.currentTarget;
                  if (!query.trim()) {
                    setOpenCategories((prev) => ({
                      ...prev,
                      [cat.id]: target.open,
                    }));
                  }
                }}
                className="ashai-details ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
              >
                <summary className="flex min-h-[3.75rem] items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition hover:bg-[var(--bg-card-hover)]">
                  <span className="flex items-center gap-3">
                    <Icon
                      className="size-5 shrink-0 text-[var(--accent-teal)]"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold tracking-[0.14em] text-[var(--text-primary)] uppercase">
                      {cat.label}
                    </span>
                  </span>

                  <span className="flex items-center gap-2.5">
                    {typeof cat.badgeCount === "number" ? (
                      <span className="rounded-full bg-[var(--bg-pill)] px-2.5 py-0.5 text-xs font-bold text-[var(--text-secondary)]">
                        {cat.badgeCount}
                      </span>
                    ) : null}
                    <Play
                      className="ashai-details-chevron size-3 fill-current text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                  </span>
                </summary>

                <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
                  {cat.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedGuide(item)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[var(--bg-card-hover)]"
                      >
                        <div className="min-w-0">
                          <span className="block text-sm font-bold text-[var(--text-primary)]">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                            {item.subtitle}
                          </span>
                        </div>
                        <ChevronRight
                          className="size-4 shrink-0 text-[var(--text-muted)]"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })
        )}
      </div>

      {/* Sign out Button */}
      <button
        type="button"
        onClick={() => setSignOutOpen(true)}
        className="ashai-card ashai-tap-target mt-2 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3.5 text-center text-base font-bold text-[var(--accent-danger)] transition hover:bg-[var(--bg-card-hover)]"
      >
        Sign out
      </button>

      <p className="pt-2 text-center text-xs text-[var(--text-muted)]">
        {APP_BUILD_TAG} · Demo UI
      </p>

      {/* Knowledge Item Modal */}
      <AccessibleModal
        open={selectedGuide !== null}
        onClose={() => setSelectedGuide(null)}
        titleId="guide-item-title"
        title={selectedGuide?.title ?? ""}
        subtitle="Demo SOP & workspace reference"
      >
        {selectedGuide ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {selectedGuide.subtitle}
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-primary)]">
              {selectedGuide.guideSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2.5">
              {selectedGuide.id === "prep-labels" ? (
                <Link
                  href="/dashboard"
                  onClick={() => setSelectedGuide(null)}
                  className="ashai-tap-target inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--accent-teal)] px-4 py-2.5 text-sm font-bold text-[var(--accent-teal-ink)]"
                >
                  Open Labels on Home
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="ashai-tap-target flex-1 rounded-xl border border-[var(--border-control)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </AccessibleModal>

      {/* Profile & Avatar Modal */}
      <AccessibleModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        titleId="profile-modal-title"
        title={state.profile.fullName}
        subtitle={`${state.profile.roleLabel} · Local demo account`}
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase">
              Profile photo (browser preview only)
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
              <label className="ashai-tap-target inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--accent-teal)] px-3.5 py-2 text-xs font-extrabold text-[var(--accent-teal-ink)]">
                <Camera className="size-4" aria-hidden="true" />
                <span>Choose photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="visually-hidden"
                />
              </label>
              {state.profile.avatarDataUrl ? (
                <button
                  type="button"
                  onClick={() => updateAvatarDataUrl(undefined)}
                  className="ashai-tap-target rounded-xl border border-[var(--border-control)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5">
            <div>
              <p className="font-bold text-[var(--text-primary)]">
                Abiso sa telepono (demo)
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Morning expiry alert status
              </p>
            </div>
            <button
              type="button"
              onClick={() => void toggleNotifications(!state.notificationsEnabled)}
              className={`min-h-10 rounded-xl px-3 text-xs font-bold ${
                state.notificationsEnabled
                  ? "bg-[var(--accent-teal)] text-[var(--accent-teal-ink)]"
                  : "border border-[var(--border-control)] text-[var(--text-secondary)]"
              }`}
            >
              {state.notificationsEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              resetDemoData();
              setProfileOpen(false);
            }}
            className="ashai-tap-target w-full rounded-xl border border-[var(--border-control)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
          >
            Reset all demo data
          </button>
        </div>
      </AccessibleModal>

      {/* Sign Out Confirmation Modal */}
      <AccessibleModal
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        titleId="signout-title"
        title="Sign out?"
        subtitle="Ends your local demo intern session."
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            You can sign right back into the demo account anytime without real
            credentials.
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              autoFocus
              onClick={() => setSignOutOpen(false)}
              className="ashai-tap-target flex-1 rounded-xl border border-[var(--border-control)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setSignOutOpen(false);
                signOut();
              }}
              className="ashai-tap-target flex-1 rounded-xl bg-[var(--accent-danger)] px-4 py-2.5 text-sm font-extrabold text-[#1a0505]"
            >
              Sign out
            </button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}

function MoreContent() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  return <MoreContentInner key={qParam} initialQuery={qParam} />;
}

export default function MorePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-sm text-[var(--text-muted)]">
          Loading menu...
        </div>
      }
    >
      <MoreContent />
    </Suspense>
  );
}
