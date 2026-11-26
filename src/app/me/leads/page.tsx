"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useInternApp } from "@/context/InternAppContext";
import { LEAD_PRODUCTS, LEAD_STATUSES } from "@/data/demoData";
import type { LeadProduct, LeadStatus } from "@/types/intern";

function addDaysIso(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function normalizeLeadHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function MyLeadsPage() {
  const {
    state,
    addLead,
    updateLeadStatus,
    updateLeadNotes,
    removeLead,
    loadSampleLeads,
  } = useInternApp();

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [leadUrl, setLeadUrl] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [product, setProduct] = useState<LeadProduct>("B2B ERP");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [notes, setNotes] = useState("");
  const [touchedBusiness, setTouchedBusiness] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | LeadStatus>("All");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const businessError =
    (touchedBusiness || submitAttempted) && !businessName.trim()
      ? "Enter the business or property name."
      : "";

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.leads.filter((lead) => {
      if (statusFilter !== "All" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.businessName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q) ||
        lead.product.toLowerCase().includes(q) ||
        lead.status.toLowerCase().includes(q) ||
        lead.notes.toLowerCase().includes(q)
      );
    });
  }, [state.leads, searchQuery, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!businessName.trim()) {
      document.getElementById("lead-business")?.focus();
      return;
    }

    addLead({
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim(),
      contactChannel: contactChannel.trim(),
      leadUrl: leadUrl.trim(),
      nextFollowUp,
      product,
      status,
      notes: notes.trim(),
    });

    setBusinessName("");
    setContactPerson("");
    setContactChannel("");
    setLeadUrl("");
    setNextFollowUp("");
    setProduct("B2B ERP");
    setStatus("New");
    setNotes("");
    setTouchedBusiness(false);
    setSubmitAttempted(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)] md:text-2xl">
          My leads
        </h1>
        <Link
          href="/oras"
          className="mt-0.5 inline-block text-xs font-semibold text-[var(--accent-teal)] hover:underline md:text-sm"
        >
          Oras at daily reports
        </Link>
      </div>

      <section
        aria-labelledby="client-leads-heading"
        className="ashai-card space-y-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 md:p-5"
      >
        <div>
          <h2
            id="client-leads-heading"
            className="text-base font-extrabold text-[var(--text-primary)] md:text-lg"
          >
            Client leads · {state.leads.length}
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
            Businesses at properties na kakausapin para sa ERP o booking
            platform. I-update ang notes at follow-up pagkatapos makipag-usap.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          aria-label="Add client lead"
          className="space-y-3"
        >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label
                  htmlFor="lead-business"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Business / property name
                </label>
                <input
                  id="lead-business"
                  name="businessName"
                  type="text"
                  required
                  value={businessName}
                  aria-invalid={businessError ? "true" : "false"}
                  aria-describedby={businessError ? "err-lead-business" : undefined}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onBlur={() => setTouchedBusiness(true)}
                  className={`ashai-control ${
                    businessError ? "user-invalid-fallback" : ""
                  }`}
                />
                {businessError ? (
                  <p
                    id="err-lead-business"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                  >
                    <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                    <span>{businessError}</span>
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="lead-contact"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Contact person
                </label>
                <input
                  id="lead-contact"
                  name="contactPerson"
                  type="text"
                  autoComplete="name"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="ashai-control"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-channel"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Email / phone / profile link
                </label>
                <input
                  id="lead-channel"
                  name="contactChannel"
                  type="text"
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                  className="ashai-control"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-url"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Link ng lead
                </label>
                <input
                  id="lead-url"
                  name="leadUrl"
                  type="url"
                  inputMode="url"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="afiyastaycation.com"
                  value={leadUrl}
                  onChange={(e) => setLeadUrl(e.target.value)}
                  className="ashai-control"
                />
              </div>

              <div>
                <label
                  htmlFor="lead-followup"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Next follow-up
                </label>
                <input
                  id="lead-followup"
                  name="nextFollowUp"
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="ashai-control"
                />
                <div className="mt-2 flex flex-wrap gap-2 md:hidden">
                  {[
                    { label: "Tomorrow", offset: 1 },
                    { label: "In 3 days", offset: 3 },
                    { label: "Next week", offset: 7 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNextFollowUp(addDaysIso(preset.offset))}
                      className="min-h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--border-teal)] hover:text-[var(--accent-teal)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lead-product"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Product
                </label>
                <select
                  id="lead-product"
                  name="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value as LeadProduct)}
                  className="ashai-control"
                >
                  {LEAD_PRODUCTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lead-status"
                  className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
                >
                  Status
                </label>
                <select
                  id="lead-status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="ashai-control"
                >
                  {LEAD_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="lead-notes"
                className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
              >
                Conversation notes / next action
              </label>
              <textarea
                id="lead-notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="ashai-control"
              />
            </div>

            <button
              type="submit"
              className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-5 py-2 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)] sm:w-auto"
            >
              Add lead
            </button>
        </form>

        {/* Search & Filter Leads */}
        <div className="space-y-3">
          <search>
            <label htmlFor="leads-search" className="visually-hidden">
              Search leads by business, contact, product, or status
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="leads-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, contact, product or status..."
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="ashai-control pl-10"
              />
            </div>
          </search>

          {state.leads.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(["All", ...LEAD_STATUSES] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  aria-pressed={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                  className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${
                    statusFilter === st
                      ? "bg-[var(--accent-teal)] text-[var(--accent-teal-ink)]"
                      : "border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] text-[var(--text-secondary)] hover:border-[var(--border-control)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          ) : null}

          {filteredLeads.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <p className="text-xs text-[var(--text-muted)] md:text-sm">
                {state.leads.length === 0
                  ? "Wala pang leads."
                  : "Walang tugmang lead sa search o filter na ito."}
              </p>
              {state.leads.length === 0 ? (
                <button
                  type="button"
                  onClick={loadSampleLeads}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--border-teal)] bg-[var(--accent-teal-soft)] px-2.5 py-1 text-xs font-bold text-[var(--accent-teal)] hover:bg-[rgba(77,196,178,0.22)]"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>Load sample leads</span>
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3 pt-1">
              {filteredLeads.map((lead) => {
                const safeHref = normalizeLeadHref(lead.leadUrl);
                const isEditingNote = editingNoteId === lead.id;

                return (
                  <li
                    key={lead.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-[var(--text-primary)]">
                          {lead.businessName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          {[lead.contactPerson, lead.contactChannel]
                            .filter(Boolean)
                            .join(" · ") || "No contact info"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLead(lead.id)}
                        aria-label={`Delete ${lead.businessName}`}
                        className="ashai-tap-target -mr-2 -mt-2 inline-flex shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-[var(--bg-pill)] px-2.5 py-1 font-semibold text-[var(--accent-teal)]">
                        {lead.product}
                      </span>
                      {lead.nextFollowUp ? (
                        <span className="rounded-md bg-[var(--bg-pill)] px-2.5 py-1 text-[var(--text-secondary)]">
                          Follow-up: {lead.nextFollowUp}
                        </span>
                      ) : null}
                      {safeHref ? (
                        <a
                          href={safeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-pill)] px-2.5 py-1 font-medium text-[var(--accent-teal)] hover:underline"
                        >
                          <span>Visit link</span>
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor={`status-${lead.id}`}
                        className="mb-1 block text-xs font-semibold text-[var(--text-muted)]"
                      >
                        Status
                      </label>
                      <select
                        id={`status-${lead.id}`}
                        value={lead.status}
                        onChange={(e) =>
                          updateLeadStatus(lead.id, e.target.value as LeadStatus)
                        }
                        className="ashai-control"
                      >
                        {LEAD_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isEditingNote ? (
                      <div className="mt-3 space-y-2">
                        <label
                          htmlFor={`edit-note-${lead.id}`}
                          className="block text-xs font-semibold text-[var(--text-muted)]"
                        >
                          Update conversation notes
                        </label>
                        <textarea
                          id={`edit-note-${lead.id}`}
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          className="ashai-control"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateLeadNotes(lead.id, editingNoteText.trim());
                              setEditingNoteId(null);
                            }}
                            className="min-h-10 rounded-xl bg-[var(--accent-teal)] px-3.5 text-xs font-bold text-[var(--accent-teal-ink)]"
                          >
                            Save note
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingNoteId(null)}
                            className="min-h-10 rounded-xl border border-[var(--border-control)] px-3.5 text-xs font-semibold text-[var(--text-secondary)]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-start justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5">
                        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                          {lead.notes || "No conversation notes yet."}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(lead.id);
                            setEditingNoteText(lead.notes);
                          }}
                          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-[var(--accent-teal)] hover:bg-[var(--accent-teal-soft)]"
                        >
                          Edit note
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
