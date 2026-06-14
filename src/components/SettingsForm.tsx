"use client";

import { useState } from "react";
import { VerificationBox } from "@/components/VerificationBox";
import type { SettingsFormData } from "@/lib/settings";

const DEFAULT_SYSTEM_PROMPT = `You are a warm, empathetic shopkeeper reaching out to lapsed customers on WhatsApp.
Your goal is to win them back with genuine care — never pushy or salesy.
Keep every message to one or two short lines, like a real text from a local shop owner.`;

function toFormState(data?: SettingsFormData) {
  return {
    business_description: data?.business_description ?? "",
    system_prompt: data?.system_prompt || DEFAULT_SYSTEM_PROMPT,
    twilio_account_sid: data?.twilio_account_sid ?? "",
    twilio_auth_token: "",
    twilio_whatsapp_number: data?.twilio_whatsapp_number ?? "",
  };
}

function WebhookUrl() {
  return (
    <code className="rounded bg-zinc-100 px-1 break-all">
      /api/webhook/twilio
    </code>
  );
}

export function SettingsForm({
  initialData,
  initialError,
}: {
  initialData?: SettingsFormData;
  initialError?: string;
}) {
  const [form, setForm] = useState(() => toFormState(initialData));
  const [hasAuthToken, setHasAuthToken] = useState(
    initialData?.has_auth_token ?? false,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Failed to save settings");
        return;
      }

      setForm({
        business_description: data.business_description ?? "",
        system_prompt: data.system_prompt || DEFAULT_SYSTEM_PROMPT,
        twilio_account_sid: data.twilio_account_sid ?? "",
        twilio_auth_token: "",
        twilio_whatsapp_number: data.twilio_whatsapp_number ?? "",
      });
      setHasAuthToken(Boolean(data.has_auth_token));
      setSavedAt(new Date().toLocaleString());
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save — could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (initialError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Could not load settings</p>
          <p className="mt-1">{initialError}</p>
        </div>
      </div>
    );
  }

  const hasSavedValues = Boolean(
    form.twilio_account_sid ||
      form.twilio_whatsapp_number ||
      form.business_description ||
      hasAuthToken,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure your business, bot personality, and Twilio credentials.
        </p>
      </div>

      {hasSavedValues && !message && (
        <div className="max-w-2xl rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Loaded saved settings. Edit any field below and click Save.
        </div>
      )}

      <form
        onSubmit={save}
        className="max-w-2xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Business description
          </label>
          <textarea
            value={form.business_description}
            onChange={(e) =>
              setForm({ ...form, business_description: e.target.value })
            }
            rows={4}
            placeholder="What does your business do? What makes it special?"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            System prompt
          </label>
          <textarea
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div className="border-t border-zinc-100 pt-5">
          <h2 className="text-sm font-semibold text-zinc-900">Twilio credentials</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Webhook URL: <WebhookUrl />
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Account SID
          </label>
          <input
            value={form.twilio_account_sid}
            onChange={(e) =>
              setForm({ ...form, twilio_account_sid: e.target.value })
            }
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Auth token {hasAuthToken && "(saved — leave blank to keep)"}
          </label>
          <input
            type="password"
            value={form.twilio_auth_token}
            onChange={(e) =>
              setForm({ ...form, twilio_auth_token: e.target.value })
            }
            placeholder={hasAuthToken ? "Leave blank to keep saved token" : "Your Twilio auth token"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            WhatsApp number
          </label>
          <input
            value={form.twilio_whatsapp_number}
            onChange={(e) =>
              setForm({ ...form, twilio_whatsapp_number: e.target.value })
            }
            placeholder="+14155238886"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              message.includes("Failed") || message.includes("could not")
                ? "text-red-600"
                : "text-emerald-700"
            }`}
          >
            {message}
            {savedAt && message.includes("successfully") && (
              <span className="block text-xs text-emerald-600">Saved at {savedAt}</span>
            )}
          </p>
        )}
      </form>

      <div className="max-w-2xl">
        <VerificationBox />
      </div>
    </div>
  );
}
