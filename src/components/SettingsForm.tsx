"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VerificationBox } from "@/components/VerificationBox";
import type { SettingsFormData } from "@/lib/settings";

const DEFAULT_SYSTEM_PROMPT = `You are a warm, empathetic shopkeeper reaching out to lapsed customers on WhatsApp.
Your goal is to win them back with genuine care — never pushy or salesy.
Keep every message to one or two short lines, like a real text from a local shop owner.`;

function hasSavedSettings(data?: SettingsFormData): boolean {
  if (!data) return false;
  return Boolean(
    data.business_description?.trim() ||
      data.system_prompt?.trim() ||
      data.twilio_account_sid?.trim() ||
      data.twilio_whatsapp_number?.trim() ||
      data.has_auth_token,
  );
}

export function SettingsForm({
  initialData,
  initialError,
}: {
  initialData?: SettingsFormData;
  initialError?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<SettingsFormData>(
    initialData ?? {
      business_description: "",
      system_prompt: DEFAULT_SYSTEM_PROMPT,
      twilio_account_sid: "",
      twilio_whatsapp_number: "",
      has_auth_token: false,
    },
  );
  const [editing, setEditing] = useState(!hasSavedSettings(initialData));
  const [form, setForm] = useState({
    business_description: saved.business_description,
    system_prompt: saved.system_prompt || DEFAULT_SYSTEM_PROMPT,
    twilio_account_sid: saved.twilio_account_sid,
    twilio_auth_token: "",
    twilio_whatsapp_number: saved.twilio_whatsapp_number,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function startEditing() {
    setForm({
      business_description: saved.business_description,
      system_prompt: saved.system_prompt || DEFAULT_SYSTEM_PROMPT,
      twilio_account_sid: saved.twilio_account_sid,
      twilio_auth_token: "",
      twilio_whatsapp_number: saved.twilio_whatsapp_number,
    });
    setMessage("");
    setEditing(true);
  }

  function cancelEditing() {
    setMessage("");
    setEditing(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    const nextSaved: SettingsFormData = {
      business_description: form.business_description,
      system_prompt: form.system_prompt,
      twilio_account_sid: form.twilio_account_sid,
      twilio_whatsapp_number: form.twilio_whatsapp_number,
      has_auth_token: saved.has_auth_token || Boolean(form.twilio_auth_token),
    };

    setSaved(nextSaved);
    setForm((f) => ({ ...f, twilio_auth_token: "" }));
    setEditing(false);
    setMessage("Settings saved.");
    setSaving(false);
    router.refresh();
  }

  const fieldClass = (readOnly: boolean) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none ${
      readOnly
        ? "cursor-default border-zinc-200 bg-zinc-50 text-zinc-600"
        : "border-zinc-300 focus:border-zinc-500"
    }`;

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

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure your business, bot personality, and Twilio credentials.
          </p>
        </div>
        {!editing && hasSavedSettings(saved) && (
          <button
            type="button"
            onClick={startEditing}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Edit settings
          </button>
        )}
      </div>

      {!editing && hasSavedSettings(saved) && (
        <div className="max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Settings saved. Fields below show your current configuration.
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
            readOnly={!editing}
            value={editing ? form.business_description : saved.business_description}
            onChange={(e) =>
              setForm({ ...form, business_description: e.target.value })
            }
            rows={4}
            placeholder="What does your business do? What makes it special?"
            className={fieldClass(!editing)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            System prompt
          </label>
          <textarea
            readOnly={!editing}
            value={editing ? form.system_prompt : saved.system_prompt || DEFAULT_SYSTEM_PROMPT}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            rows={6}
            className={fieldClass(!editing)}
          />
        </div>

        <div className="border-t border-zinc-100 pt-5">
          <h2 className="text-sm font-semibold text-zinc-900">Twilio credentials</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Webhook URL:{" "}
            <code className="rounded bg-zinc-100 px-1">
              {typeof window !== "undefined"
                ? `${window.location.origin}/api/webhook/twilio`
                : "/api/webhook/twilio"}
            </code>
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Account SID
          </label>
          <input
            readOnly={!editing}
            value={editing ? form.twilio_account_sid : saved.twilio_account_sid}
            onChange={(e) =>
              setForm({ ...form, twilio_account_sid: e.target.value })
            }
            className={fieldClass(!editing)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Auth token
          </label>
          <input
            readOnly={!editing}
            type={editing ? "password" : "text"}
            value={
              editing
                ? form.twilio_auth_token
                : saved.has_auth_token
                  ? "••••••••••••"
                  : ""
            }
            onChange={(e) =>
              setForm({ ...form, twilio_auth_token: e.target.value })
            }
            placeholder={editing && saved.has_auth_token ? "Leave blank to keep saved token" : ""}
            className={fieldClass(!editing)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            WhatsApp number
          </label>
          <input
            readOnly={!editing}
            value={editing ? form.twilio_whatsapp_number : saved.twilio_whatsapp_number}
            onChange={(e) =>
              setForm({ ...form, twilio_whatsapp_number: e.target.value })
            }
            placeholder="+14155238886"
            className={fieldClass(!editing)}
          />
        </div>

        {editing && (
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
            {hasSavedSettings(saved) && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {message && (
          <p
            className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
      </form>

      <div className="max-w-2xl">
        <VerificationBox />
      </div>
    </div>
  );
}
