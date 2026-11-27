"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  History,
  Package,
  Trash2,
} from "lucide-react";
import { useInternApp } from "@/context/InternAppContext";
import type { LeaveType, RequestCategory } from "@/types/intern";

const REQUEST_TYPES: {
  id: RequestCategory;
  label: string;
  icon: typeof Calendar;
  guidance: string[];
}[] = [
  {
    id: "Leave",
    label: "Leave",
    icon: Calendar,
    guidance: [
      "Mapupunta ito sa Staff requests ng opisina bilang Leave — si Sir Joshua ang mag-a-approve.",
      "Kapag na-approve, kasama na ito sa cut-off.",
      "Habang wala pang sagot, makikita mo ito sa Request sa ibaba.",
    ],
  },
  {
    id: "Materials",
    label: "Materials",
    icon: Package,
    guidance: [
      "I-lista ang eksaktong gamit, sukat, o thermal roll na kailangan sa trabaho.",
      "Ipapakita sa demo list sa ibaba para ma-track habang wala pang approval.",
      "Demo workflow only — hindi ito nagsusumite sa live purchasing backend.",
    ],
  },
  {
    id: "Time-in correction",
    label: "Time-in correction",
    icon: History,
    guidance: [
      "Gamitin kapag nakalimutang mag-time in/out o may maling oras sa Oras log.",
      "Ilagay ang eksaktong petsa, tamang oras, at dahilan ng pagbabago.",
      "Demo workflow only — makikita ang sample ticket sa My Requests sa ibaba.",
    ],
  },
];

function computeDaysInclusive(fromDate: string, untilDate: string): string {
  if (!fromDate || !untilDate) return "";
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${untilDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return diffDays >= 1 ? String(diffDays) : "";
}

export default function RequestPage() {
  const { state, addRequest, removeRequest } = useInternApp();
  const [category, setCategory] = useState<RequestCategory>("Leave");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Leave fields
  const [leaveType, setLeaveType] = useState<LeaveType>("Vacation leave");
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveUntil, setLeaveUntil] = useState("");
  const [leaveDays, setLeaveDays] = useState("");

  // Materials fields
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("");
  const [materialNeededBy, setMaterialNeededBy] = useState("");

  // Time-in correction fields
  const [correctionDate, setCorrectionDate] = useState("");
  const [correctionKind, setCorrectionKind] = useState("Missed time-in");
  const [correctionTime, setCorrectionTime] = useState("");

  // Shared details
  const [reason, setReason] = useState("");

  const activeConfig = useMemo(
    () => REQUEST_TYPES.find((item) => item.id === category)!,
    [category]
  );

  const errors = useMemo(() => {
    const map: Record<string, string> = {};
    if (category === "Leave") {
      if (!leaveFrom) map.leaveFrom = "Select the start date of your leave.";
      if (!leaveUntil) map.leaveUntil = "Select the last day off.";
      else if (leaveFrom && leaveUntil < leaveFrom) {
        map.leaveUntil = "Last day off must be on or after the From date.";
      }
      const parsedDays = Number(leaveDays);
      if (!leaveDays || Number.isNaN(parsedDays) || parsedDays <= 0) {
        map.leaveDays = "Enter the number of days (at least 0.5).";
      }
    } else if (category === "Materials") {
      if (!materialName.trim()) {
        map.materialName = "Enter the material or supply needed.";
      }
      if (!materialQty.trim()) {
        map.materialQty = "Enter the quantity and unit (e.g. 2 rolls).";
      }
    } else if (category === "Time-in correction") {
      if (!correctionDate) map.correctionDate = "Pick the affected workday.";
      if (!correctionTime) map.correctionTime = "Enter the actual time.";
    }

    if (!reason.trim()) {
      map.reason = "Provide a brief reason or details for this request.";
    }
    return map;
  }, [
    category,
    leaveFrom,
    leaveUntil,
    leaveDays,
    materialName,
    materialQty,
    correctionDate,
    correctionTime,
    reason,
  ]);

  const showError = (fieldKey: string) =>
    Boolean((touched[fieldKey] || submitAttempted) && errors[fieldKey]);

  const switchCategory = (next: RequestCategory) => {
    setCategory(next);
    setTouched({});
    setSubmitAttempted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const firstInvalidKey = Object.keys(errors)[0];
    if (firstInvalidKey) {
      document.getElementById(`req-${firstInvalidKey}`)?.focus();
      return;
    }

    if (category === "Leave") {
      addRequest({
        category: "Leave",
        title: `${leaveType} (${leaveDays} day${leaveDays === "1" ? "" : "s"})`,
        summary: `${leaveFrom} to ${leaveUntil}`,
        details: reason.trim(),
      });
      setLeaveFrom("");
      setLeaveUntil("");
      setLeaveDays("");
    } else if (category === "Materials") {
      addRequest({
        category: "Materials",
        title: `${materialName.trim()} · ${materialQty.trim()}`,
        summary: materialNeededBy
          ? `Needed by ${materialNeededBy}`
          : "Standard request",
        details: reason.trim(),
      });
      setMaterialName("");
      setMaterialQty("");
      setMaterialNeededBy("");
    } else {
      addRequest({
        category: "Time-in correction",
        title: `${correctionKind} · ${correctionDate}`,
        summary: `Actual time: ${correctionTime}`,
        details: reason.trim(),
      });
      setCorrectionDate("");
      setCorrectionTime("");
    }

    setReason("");
    setTouched({});
    setSubmitAttempted(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Request
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Piliin mo ang klase, tapos sagutan mo.
        </p>
      </div>

      {/* 3-Column Category Selector */}
      <div
        role="group"
        aria-label="Request categories"
        className="grid grid-cols-3 gap-2.5 sm:gap-3"
      >
        {REQUEST_TYPES.map((item) => {
          const Icon = item.icon;
          const selected = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => switchCategory(item.id)}
              className={`flex min-h-[4.85rem] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition ${
                selected
                  ? "border-[var(--accent-teal)] bg-[var(--accent-teal)] text-[var(--accent-teal-ink)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-bold leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Request Form Card */}
      <form
        noValidate
        onSubmit={handleSubmit}
        aria-label={`${category} request form`}
        className="space-y-4"
      >
        <div className="ashai-card space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          {category === "Leave" ? (
            <>
              <div>
                <label
                  htmlFor="req-leaveType"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Type
                </label>
                <select
                  id="req-leaveType"
                  name="leaveType"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="ashai-control"
                >
                  <option value="Vacation leave">Vacation leave</option>
                  <option value="Sick leave">Sick leave</option>
                  <option value="Emergency leave">Emergency leave</option>
                  <option value="School / OJT requirement">
                    School / OJT requirement
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="req-leaveFrom"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    From <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="req-leaveFrom"
                    name="leaveFrom"
                    type="date"
                    required
                    value={leaveFrom}
                    aria-invalid={showError("leaveFrom") ? "true" : "false"}
                    aria-describedby={
                      showError("leaveFrom") ? "err-leaveFrom" : undefined
                    }
                    onChange={(e) => {
                      const nextFrom = e.target.value;
                      setLeaveFrom(nextFrom);
                      const computed = computeDaysInclusive(
                        nextFrom,
                        leaveUntil
                      );
                      if (computed) setLeaveDays(computed);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, leaveFrom: true }))
                    }
                    className={`ashai-control ${
                      showError("leaveFrom") ? "user-invalid-fallback" : ""
                    }`}
                  />
                  {showError("leaveFrom") ? (
                    <p
                      id="err-leaveFrom"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{errors.leaveFrom}</span>
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="req-leaveUntil"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Until (last day off) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="req-leaveUntil"
                    name="leaveUntil"
                    type="date"
                    required
                    min={leaveFrom || undefined}
                    value={leaveUntil}
                    aria-invalid={showError("leaveUntil") ? "true" : "false"}
                    aria-describedby={
                      showError("leaveUntil") ? "err-leaveUntil" : undefined
                    }
                    onChange={(e) => {
                      const nextUntil = e.target.value;
                      setLeaveUntil(nextUntil);
                      const computed = computeDaysInclusive(
                        leaveFrom,
                        nextUntil
                      );
                      if (computed) setLeaveDays(computed);
                    }}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, leaveUntil: true }))
                    }
                    className={`ashai-control ${
                      showError("leaveUntil") ? "user-invalid-fallback" : ""
                    }`}
                  />
                  {showError("leaveUntil") ? (
                    <p
                      id="err-leaveUntil"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{errors.leaveUntil}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="req-leaveDays"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  How many (days) <span aria-hidden="true">*</span>
                </label>
                <span
                  id="hint-leaveDays"
                  className="mb-1.5 block text-xs text-[var(--text-muted)]"
                >
                  Auto-fills from From/Until dates; adjust if half-day (e.g. 0.5).
                </span>
                <input
                  id="req-leaveDays"
                  name="leaveDays"
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  required
                  placeholder="0"
                  value={leaveDays}
                  aria-invalid={showError("leaveDays") ? "true" : "false"}
                  aria-describedby={
                    showError("leaveDays")
                      ? "hint-leaveDays err-leaveDays"
                      : "hint-leaveDays"
                  }
                  onChange={(e) => setLeaveDays(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, leaveDays: true }))
                  }
                  className={`ashai-control ${
                    showError("leaveDays") ? "user-invalid-fallback" : ""
                  }`}
                />
                {showError("leaveDays") ? (
                  <p
                    id="err-leaveDays"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                  >
                    <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                    <span>{errors.leaveDays}</span>
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {category === "Materials" ? (
            <>
              <div>
                <label
                  htmlFor="req-materialName"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Material / supply needed <span aria-hidden="true">*</span>
                </label>
                <input
                  id="req-materialName"
                  name="materialName"
                  type="text"
                  required
                  value={materialName}
                  placeholder="e.g. Thermal sticker roll 50x30mm"
                  aria-invalid={showError("materialName") ? "true" : "false"}
                  aria-describedby={
                    showError("materialName") ? "err-materialName" : undefined
                  }
                  onChange={(e) => setMaterialName(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, materialName: true }))
                  }
                  className={`ashai-control ${
                    showError("materialName") ? "user-invalid-fallback" : ""
                  }`}
                />
                {showError("materialName") ? (
                  <p
                    id="err-materialName"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                  >
                    <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                    <span>{errors.materialName}</span>
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="req-materialQty"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Quantity &amp; unit <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="req-materialQty"
                    name="materialQty"
                    type="text"
                    required
                    value={materialQty}
                    placeholder="e.g. 3 rolls"
                    aria-invalid={showError("materialQty") ? "true" : "false"}
                    aria-describedby={
                      showError("materialQty") ? "err-materialQty" : undefined
                    }
                    onChange={(e) => setMaterialQty(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, materialQty: true }))
                    }
                    className={`ashai-control ${
                      showError("materialQty") ? "user-invalid-fallback" : ""
                    }`}
                  />
                  {showError("materialQty") ? (
                    <p
                      id="err-materialQty"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{errors.materialQty}</span>
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="req-materialNeededBy"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Needed by
                  </label>
                  <input
                    id="req-materialNeededBy"
                    name="materialNeededBy"
                    type="date"
                    value={materialNeededBy}
                    onChange={(e) => setMaterialNeededBy(e.target.value)}
                    className="ashai-control"
                  />
                </div>
              </div>
            </>
          ) : null}

          {category === "Time-in correction" ? (
            <>
              <div>
                <label
                  htmlFor="req-correctionKind"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Correction type
                </label>
                <select
                  id="req-correctionKind"
                  name="correctionKind"
                  value={correctionKind}
                  onChange={(e) => setCorrectionKind(e.target.value)}
                  className="ashai-control"
                >
                  <option value="Missed time-in">Missed time-in</option>
                  <option value="Missed time-out">Missed time-out</option>
                  <option value="Incorrect recorded time">
                    Incorrect recorded time
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="req-correctionDate"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Workday date <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="req-correctionDate"
                    name="correctionDate"
                    type="date"
                    required
                    value={correctionDate}
                    aria-invalid={showError("correctionDate") ? "true" : "false"}
                    aria-describedby={
                      showError("correctionDate")
                        ? "err-correctionDate"
                        : undefined
                    }
                    onChange={(e) => setCorrectionDate(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, correctionDate: true }))
                    }
                    className={`ashai-control ${
                      showError("correctionDate") ? "user-invalid-fallback" : ""
                    }`}
                  />
                  {showError("correctionDate") ? (
                    <p
                      id="err-correctionDate"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{errors.correctionDate}</span>
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="req-correctionTime"
                    className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Actual time <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="req-correctionTime"
                    name="correctionTime"
                    type="time"
                    required
                    value={correctionTime}
                    aria-invalid={showError("correctionTime") ? "true" : "false"}
                    aria-describedby={
                      showError("correctionTime")
                        ? "err-correctionTime"
                        : undefined
                    }
                    onChange={(e) => setCorrectionTime(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, correctionTime: true }))
                    }
                    className={`ashai-control ${
                      showError("correctionTime") ? "user-invalid-fallback" : ""
                    }`}
                  />
                  {showError("correctionTime") ? (
                    <p
                      id="err-correctionTime"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
                    >
                      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                      <span>{errors.correctionTime}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          <div>
            <label
              htmlFor="req-reason"
              className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
            >
              Reason / details <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="req-reason"
              name="reason"
              required
              value={reason}
              placeholder="Ilagay ang maikling paliwanag o detalye..."
              aria-invalid={showError("reason") ? "true" : "false"}
              aria-describedby={showError("reason") ? "err-reason" : undefined}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, reason: true }))}
              className={`ashai-control ${
                showError("reason") ? "user-invalid-fallback" : ""
              }`}
            />
            {showError("reason") ? (
              <p
                id="err-reason"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--accent-danger)]"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{errors.reason}</span>
              </p>
            ) : null}
          </div>
        </div>

        {/* Submission Guidance Card */}
        <section
          aria-labelledby="kapag-nasend-heading"
          className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
        >
          <h2
            id="kapag-nasend-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            Kapag na-send mo ito
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
            {activeConfig.guidance.map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-[var(--accent-success)]"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <button
          type="submit"
          className="ashai-tap-target w-full rounded-xl bg-[var(--accent-teal)] px-4 py-3.5 text-base font-extrabold text-[var(--accent-teal-ink)] transition hover:bg-[var(--accent-teal-hover)]"
        >
          Send {category.toLowerCase()} request (Demo)
        </button>
      </form>

      {/* MY REQUESTS Card */}
      <section
        aria-labelledby="my-requests-heading"
        className="ashai-card rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="my-requests-heading"
            className="text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase"
          >
            My requests
          </h2>
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {state.requests.length} total
          </span>
        </div>

        {state.requests.length === 0 ? (
          <p className="py-5 text-center text-sm leading-relaxed text-[var(--text-secondary)]">
            No requests yet. Pick one above — leave, materials, or time-in
            correction.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {state.requests.map((req) => (
              <li
                key={req.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-inner)] p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[var(--accent-teal-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent-teal)]">
                        {req.category}
                      </span>
                      <span className="rounded-md bg-[var(--bg-pill)] px-2 py-0.5 text-[0.7rem] font-medium text-[var(--accent-amber)]">
                        {req.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-bold text-[var(--text-primary)]">
                      {req.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {req.summary} · {req.createdAtLabel}
                    </p>
                    <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                      {req.details}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRequest(req.id)}
                    aria-label={`Withdraw ${req.title}`}
                    className="ashai-tap-target inline-flex shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--accent-danger-soft)] hover:text-[var(--accent-danger)]"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
