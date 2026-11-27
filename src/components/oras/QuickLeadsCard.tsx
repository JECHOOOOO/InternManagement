"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Search, Trash2 } from "lucide-react";
import { LEAD_PRODUCTS, LEAD_STATUSES } from "@/data/demoData";
import type { ClientLead, LeadProduct, LeadStatus } from "@/types/intern";

interface QuickLeadsCardProps {
  leads: ClientLead[];
  onAddLead: (lead: Omit<ClientLead, "id" | "createdAtLabel">) => void;
  onRemoveLead: (id: string) => void;
}

export function QuickLeadsCard({
  leads,
  onAddLead,
  onRemoveLead,
}: QuickLeadsCardProps) {
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactChannel, setContactChannel] = useState("");
  const [leadUrl, setLeadUrl] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [product, setProduct] = useState<LeadProduct>("B2B ERP");
  const [status, setStatus] = useState<LeadStatus>("New");
  const [notes, setNotes] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const businessError =
    submitAttempted && !businessName.trim()
      ? "Enter the business or property name."
      : "";

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.businessName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q) ||
        lead.product.toLowerCase().includes(q) ||
        lead.status.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!businessName.trim()) {
      document.getElementById("oras-lead-business")?.focus();
      return;
    }

    onAddLead({
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
    setSubmitAttempted(false);
  };

  return (
    <section
      aria-labelledby="oras-client-leads-heading"
      className="ashai-card space-y-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
    >
      <div>
        <h2
          id="oras-client-leads-heading"
          className="text-base font-extrabold text-[var(--text-primary)]"
        >
          Client leads · {leads.length}
        </h2>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
          Businesses at properties na kakausapin para sa ERP o booking platform.
          I-update ang notes at follow-up pagkatapos makipag-usap.
        </p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-label="Quick add client lead"
        className="space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="oras-lead-business"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Business / property name
            </label>
            <input
              id="oras-lead-business"
              type="text"
              required
              value={businessName}
              aria-invalid={businessError ? "true" : "false"}
              onChange={(e) => setBusinessName(e.target.value)}
              className={`ashai-control ${
                businessError ? "user-invalid-fallback" : ""
              }`}
            />
            {businessError ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-[var(--accent-danger)]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{businessError}</span>
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="oras-lead-contact"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Contact person
            </label>
            <input
              id="oras-lead-contact"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="ashai-control"
            />
          </div>

          <div>
            <label
              htmlFor="oras-lead-channel"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Email / phone / profile link
            </label>
            <input
              id="oras-lead-channel"
              type="text"
              value={contactChannel}
              onChange={(e) => setContactChannel(e.target.value)}
              className="ashai-control"
            />
          </div>

          <div>
            <label
              htmlFor="oras-lead-url"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Link ng lead
            </label>
            <input
              id="oras-lead-url"
              type="url"
              placeholder="afiyastaycation.com"
              value={leadUrl}
              onChange={(e) => setLeadUrl(e.target.value)}
              className="ashai-control"
            />
          </div>

          <div>
            <label
              htmlFor="oras-lead-followup"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Next follow-up
            </label>
            <input
              id="oras-lead-followup"
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="ashai-control"
            />
          </div>

          <div>
            <label
              htmlFor="oras-lead-product"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Product
            </label>
            <select
              id="oras-lead-product"
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

          <div className="sm:col-span-2">
            <label
              htmlFor="oras-lead-status"
              className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
            >
              Status
            </label>
            <select
              id="oras-lead-status"
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
            htmlFor="oras-lead-notes"
            className="mb-1 block text-xs font-bold text-[var(--text-primary)]"
          >
            Conversation notes / next action
          </label>
          <textarea
            id="oras-lead-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="ashai-control"
          />
        </div>

        <button
          type="submit"
          className="ashai-tap-target rounded-xl bg-[var(--accent-teal)] px-4 py-2 text-sm font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
        >
          Add lead
        </button>
      </form>

      <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            aria-label="Search client leads"
            className="ashai-control pl-10"
          />
        </div>

        {filteredLeads.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">
            {leads.length === 0
              ? "Wala pang leads."
              : "Walang tugmang lead."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredLeads.slice(0, 4).map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-[var(--text-primary)]">
                    {lead.businessName}
                  </p>
                  <p className="truncate text-[var(--text-muted)]">
                    {lead.product} · {lead.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLead(lead.id)}
                  aria-label={`Delete ${lead.businessName}`}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-danger)]"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
