"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Offer } from "@/lib/types";

export function AddLeadForm() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    last_purchase: "",
    context: "",
    offer_text: "",
    create_new_offer: false,
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importReport, setImportReport] = useState<{
    imported: number;
    duplicates: { row: number; mobile: string }[];
    errors: { row: number; error: string }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then(setOffers)
      .catch(() => {});
  }, []);

  async function submitSingle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        mobile: form.mobile,
        last_purchase: form.last_purchase || null,
        context: form.context || null,
        offer_text: form.offer_text || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(
        data.duplicate
          ? "This mobile number already has an existing chat."
          : data.error ?? "Failed to add lead",
      );
      setLoading(false);
      return;
    }

    router.push(`/leads/${data.id}`);
  }

  async function submitCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!csvFile) return;

    setLoading(true);
    setError("");
    setImportReport(null);

    const body = new FormData();
    body.append("file", csvFile);

    const res = await fetch("/api/leads/bulk", { method: "POST", body });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Import failed");
      setLoading(false);
      return;
    }

    setImportReport(data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to leads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Add lead</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A WhatsApp opener fires automatically on add (respecting quiet hours).
        </p>
      </div>

      <div className="flex gap-2">
        {(["single", "csv"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === m
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {m === "single" ? "Single entry" : "CSV upload"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {mode === "single" ? (
        <form
          onSubmit={submitSingle}
          className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="+91..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Last purchase
            </label>
            <input
              value={form.last_purchase}
              onChange={(e) => setForm({ ...form, last_purchase: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Context
            </label>
            <textarea
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Offer
            </label>
            {!form.create_new_offer ? (
              <select
                value={form.offer_text}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setForm({ ...form, create_new_offer: true, offer_text: "" });
                  } else {
                    setForm({ ...form, offer_text: e.target.value });
                  }
                }}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="">No offer</option>
                {offers.map((o) => (
                  <option key={o.id} value={o.text}>
                    {o.text}
                  </option>
                ))}
                <option value="__new__">+ Create new offer</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  value={form.offer_text}
                  onChange={(e) => setForm({ ...form, offer_text: e.target.value })}
                  placeholder="Describe the offer..."
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, create_new_offer: false, offer_text: "" })
                  }
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add lead & send opener"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={submitCsv}
          className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <p className="text-sm text-zinc-600">
            CSV columns: <code className="text-xs">name, mobile, last_purchase, context, offer</code>
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
          <button
            type="submit"
            disabled={loading || !csvFile}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Upload & import"}
          </button>

          {importReport && (
            <div className="rounded-lg bg-zinc-50 p-4 text-sm">
              <p className="font-medium text-emerald-700">
                Imported {importReport.imported} lead(s)
              </p>
              {importReport.duplicates.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-amber-700">Skipped duplicates:</p>
                  <ul className="mt-1 list-inside list-disc text-zinc-600">
                    {importReport.duplicates.map((d) => (
                      <li key={`${d.row}-${d.mobile}`}>
                        Row {d.row}: {d.mobile}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {importReport.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-700">Errors:</p>
                  <ul className="mt-1 list-inside list-disc text-zinc-600">
                    {importReport.errors.map((e) => (
                      <li key={`${e.row}-${e.error}`}>
                        Row {e.row}: {e.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
