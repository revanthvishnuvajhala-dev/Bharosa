"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { LeadWithOffer, Message } from "@/lib/types";

export function LeadDetail({
  leadId,
  initialLead,
  initialMessages,
}: {
  leadId: string;
  initialLead: LeadWithOffer;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadWithOffer>(initialLead);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: initialLead.name,
    mobile: initialLead.mobile,
    last_purchase: initialLead.last_purchase ?? "",
    context: initialLead.context ?? "",
    offer_text: initialLead.offers?.text ?? "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Lead not found");
        return;
      }
      const data = await res.json();
      setLead(data.lead);
      setMessages(data.messages ?? []);
      setForm({
        name: data.lead.name,
        mobile: data.lead.mobile,
        last_purchase: data.lead.last_purchase ?? "",
        context: data.lead.context ?? "",
        offer_text: data.lead.offers?.text ?? "",
      });
    } catch {
      setError("Could not refresh lead data.");
    } finally {
      setRefreshing(false);
    }
  }

  async function save() {
    setActionLoading(true);
    setError("");
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      setActionLoading(false);
      return;
    }
    setEditing(false);
    await load();
    setActionLoading(false);
  }

  async function remove() {
    if (!confirm("Delete this lead and all messages?")) return;
    setActionLoading(true);
    await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
    router.push("/");
  }

  async function retry() {
    setActionLoading(true);
    const res = await fetch(`/api/leads/${leadId}/retry`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Retry failed");
    } else {
      await load();
    }
    setActionLoading(false);
  }

  async function redeem() {
    setActionLoading(true);
    const res = await fetch(`/api/leads/${leadId}/redeem`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Redemption failed");
    } else {
      await load();
    }
    setActionLoading(false);
  }

  const visibleMessages = messages.filter(
    (m) => m.sent_at || m.direction === "inbound",
  );
  const pendingOutbound = messages.some(
    (m) => m.direction === "outbound" && !m.sent_at,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to leads
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{lead.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            {lead.escalated && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20 ring-inset">
                Escalated
              </span>
            )}
            {refreshing && (
              <span className="text-xs text-zinc-400">Refreshing…</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.status === "message_failed_to_send" && (
            <button
              type="button"
              onClick={retry}
              disabled={actionLoading}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Retry send
            </button>
          )}
          {lead.redemption_code && lead.status !== "code_redeemed" && (
            <button
              type="button"
              onClick={redeem}
              disabled={actionLoading}
              className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              Mark redeemed
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={actionLoading}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {pendingOutbound && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          WhatsApp opener is queued and will send during quiet hours (10am–7pm IST).
        </div>
      )}

      {lead.status === "sent" && !pendingOutbound && visibleMessages.length > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Message successfully sent.
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          {editing ? (
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              {(["name", "mobile", "last_purchase", "context", "offer_text"] as const).map(
                (field) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-medium uppercase text-zinc-500">
                      {field.replace("_", " ")}
                    </label>
                    <input
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    />
                  </div>
                ),
              )}
              <button
                type="button"
                onClick={save}
                disabled={actionLoading}
                className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                Save changes
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-zinc-500">Mobile</dt>
                  <dd className="font-medium text-zinc-900">{lead.mobile}</dd>
                </div>
                {lead.last_purchase && (
                  <div>
                    <dt className="text-zinc-500">Last purchase</dt>
                    <dd className="text-zinc-900">{lead.last_purchase}</dd>
                  </div>
                )}
                {lead.context && (
                  <div>
                    <dt className="text-zinc-500">Context</dt>
                    <dd className="text-zinc-900">{lead.context}</dd>
                  </div>
                )}
                {lead.offers && (
                  <div>
                    <dt className="text-zinc-500">Offer</dt>
                    <dd className="text-zinc-900">{lead.offers.text}</dd>
                  </div>
                )}
                {lead.redemption_code && (
                  <div>
                    <dt className="text-zinc-500">Redemption code</dt>
                    <dd className="font-mono text-lg font-semibold tracking-widest text-zinc-900">
                      {lead.redemption_code}
                    </dd>
                  </div>
                )}
              </dl>
              {lead.summary && (
                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <p className="text-xs font-medium uppercase text-zinc-500">Summary</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-zinc-700">
                    {lead.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="font-semibold text-zinc-900">Conversation</h2>
            </div>
            <div className="max-h-[32rem] space-y-3 overflow-y-auto p-5">
              {visibleMessages.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  {pendingOutbound
                    ? "Opener queued — not sent yet."
                    : "No messages yet."}
                </p>
              ) : (
                visibleMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        msg.direction === "outbound"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-100 text-zinc-900"
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.direction === "outbound"
                            ? "text-emerald-100"
                            : "text-zinc-400"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
