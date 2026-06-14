"use client";

import { useState } from "react";

interface VerifiedLead {
  id: string;
  name: string;
  mobile: string;
  status: string;
  already_redeemed: boolean;
  offer?: { text: string } | null;
}

export function VerificationBox() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedLead | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState("");

  async function verify() {
    setLoading(true);
    setInvalid(false);
    setResult(null);
    setMessage("");

    try {
      const res = await fetch("/api/redemption/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!data.valid) {
        setInvalid(true);
        return;
      }

      setResult(data.lead);
    } catch {
      setMessage("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function markRedeemed() {
    if (!result) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/leads/${result.id}/redeem`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Failed to mark redeemed");
        return;
      }

      setResult({ ...result, already_redeemed: true, status: "code_redeemed" });
      setMessage("Code marked as redeemed.");
      setCode("");
    } catch {
      setMessage("Failed to mark redeemed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">Verify redemption code</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Enter a customer&apos;s code to verify and mark it redeemed.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ABC234"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-zinc-500"
          maxLength={6}
        />
        <button
          type="button"
          onClick={verify}
          disabled={loading || code.length < 6}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          Verify
        </button>
      </div>

      {invalid && (
        <p className="mt-3 text-sm text-red-600">Invalid code — not found in the system.</p>
      )}

      {result && (
        <div className="mt-4 rounded-lg bg-zinc-50 p-4">
          <p className="font-medium text-zinc-900">{result.name}</p>
          <p className="text-sm text-zinc-600">{result.mobile}</p>
          {result.offer && (
            <p className="mt-2 text-sm text-zinc-600">Offer: {result.offer.text}</p>
          )}
          {result.already_redeemed ? (
            <p className="mt-2 text-sm font-medium text-violet-700">Already redeemed</p>
          ) : (
            <button
              type="button"
              onClick={markRedeemed}
              disabled={loading}
              className="mt-3 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              Mark redeemed
            </button>
          )}
        </div>
      )}

      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
