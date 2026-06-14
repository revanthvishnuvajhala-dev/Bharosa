"use client";

import { useState } from "react";
import { VerificationBox } from "@/components/VerificationBox";
import type { SettingsFormData } from "@/lib/settings";

const DEFAULT_SYSTEM_PROMPT = `You are a warm, empathetic shopkeeper reaching out to lapsed customers on WhatsApp.
Your goal is to win them back with genuine care — never pushy or salesy.
Keep every message to one or two short lines, like a real text from a local shop owner.`;

function hasSavedSettings(data: SettingsFormData): boolean {
  return Boolean(
    data.business_description?.trim() ||
      data.twilio_account_sid?.trim() ||
      data.twilio_whatsapp_number?.trim() ||
      data.has_auth_token,
  );
}

function toFormData(data?: SettingsFormData): SettingsFormData {
  return {
    business_description: data?.business_description ?? "",
    system_prompt: data?.system_prompt || DEFAULT_SYSTEM_PROMPT,
    twilio_account_sid: data?.twilio_account_sid ?? "",
    twilio_whatsapp_number: data?.twilio_whatsapp_number ?? "",
    has_auth_token: data?.has_auth_token ?? false,
  };
}

export function SettingsForm({
  initialData,
  initialError,
}: {
  initialData?: SettingsFormData;
  initialError?: string;
}) {
  const [saved, setSaved] = useState<SettingsFormData>(() =>
    toFormData(initialData),
  );
  const [editing, setEditing] = useState(() => !hasSavedSettings(toFormData(initialData)));
  const [form, setForm] = useState(() => ({
    business_description: toFormData(initialData).business_description,
    system_prompt: toFormData(initialData).system_prompt,
    twilio_account_sid: toFormData(initialData).twilio_account_sid,
    twilio_auth_token: "",
    twilio_whatsapp_number: toFormData(initialData).twilio_whatsapp_number,
  }));
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

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_description: form.business_description,
          system_prompt: form.system_prompt,
          twilio_account_sid: form.twilio_account_sid,
          twilio_auth_token: form.twilio_auth_token,
          twilio_whatsapp_number: form.twilio_whatsapp_number,
        }),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Failed to save settings");
        return;
      }

      const nextSaved: SettingsFormData = {
        business_description: data.business_description ?? "",
        system_prompt: data.system_prompt || DEFAULT_SYSTEM_PROMPT,
        twilio_account_sid: data.twilio_account_sid ?? "",
        twilio_whatsapp_number: data.twilio_whatsapp_number ?? "",
        has_auth_token: Boolean(data.has_auth_token),
      };

      setSaved(nextSaved);
      setForm({
        business_description: nextSaved.business_description,
        system_prompt: nextSaved.system_prompt,
        twilio_account_sid: nextSaved.twilio_account_sid,
        twilio_auth_token: "",
        twilio_whatsapp_number: nextSaved.twilio_whatsapp_number,
      });
      setEditing(false);
      setMessage("Settings saved successfully.");
    } catch {
      setMessage("Failed to save — could not reach the server.");
    } finally {
      setSaving(false);
    }
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

  const showSavedBanner = !editing && hasSavedSettings(saved);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure your business, bot personality, and Twilio credentials.
        </p>
      </div>

      {showSavedBanner && (
        <div className="max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Settings saved. Use the button below to make changes.
        </div>
      )}

      <form
        onSubmit={save}
        className="relative z-0 max-w-2xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Business description
          </label>
          <textarea
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
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
            tabIndex={editing ? 0 : -1}
            value={editing ? form.system_prompt : saved.system_prompt}
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
            tabIndex={editing ? 0 : -1}
            value={editing ? form.twilio_account_sid : saved.twilio_account_sid}
            onChange={(e) =>
              setForm({ ...form, twilio_account_sid: e.target.value })
            }
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className={fieldClass(!editing)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Auth token
          </label>
          <input
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
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
            tabIndex={editing ? 0 : -1}
            value={editing ? form.twilio_whatsapp_number : saved.twilio_whatsapp_number}
            onChange={(e) =>
              setForm({ ...form, twilio_whatsapp_number: e.target.value })
            }
            placeholder="+14155238886"
            className={fieldClass(!editing)}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-2 border-t border-zinc-100 pt-5 sm:flex-row">
          {editing ? (
            <>
              <button
                type="submit"
                disabled={saving}
                className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>
              {hasSavedSettings(saved) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEditing}
                  className="cursor-pointer rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </>
          ) : hasSavedSettings(saved) ? (
            <button
              type="button"
              onClick={startEditing}
              className="w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 sm:w-auto"
            >
              Edit settings
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
          )}
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("Failed") || message.includes("could not")
                ? "text-red-600"
                : "text-emerald-700"
            }`}
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
