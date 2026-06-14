"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SettingsFormData } from "@/lib/settings";

const DEFAULT_SYSTEM_PROMPT = `You are a warm, empathetic shopkeeper reaching out to lapsed customers on WhatsApp.
Your goal is to win them back with genuine care — never pushy or salesy.
Keep every message to one or two short lines, like a real text from a local shop owner.`;

const fieldClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500";

interface SettingsFormProps {
  initialData: SettingsFormData;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter();
  const [businessDescription, setBusinessDescription] = useState(
    initialData.business_description,
  );
  const [systemPrompt, setSystemPrompt] = useState(
    initialData.system_prompt || DEFAULT_SYSTEM_PROMPT,
  );
  const [accountSid, setAccountSid] = useState(initialData.twilio_account_sid);
  const [authToken, setAuthToken] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialData.twilio_whatsapp_number,
  );
  const [hasAuthToken, setHasAuthToken] = useState(initialData.has_auth_token);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_description: businessDescription,
          system_prompt: systemPrompt,
          twilio_account_sid: accountSid,
          twilio_whatsapp_number: whatsappNumber,
          ...(authToken ? { twilio_auth_token: authToken } : {}),
        }),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Failed to save settings");
        return;
      }

      setBusinessDescription(data.business_description ?? "");
      setSystemPrompt(data.system_prompt ?? "");
      setAccountSid(data.twilio_account_sid ?? "");
      setWhatsappNumber(data.twilio_whatsapp_number ?? "");
      setHasAuthToken(Boolean(data.has_auth_token));
      setAuthToken("");
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Failed to save settings. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      {status === "saved" && (
        <div className="max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Settings saved successfully. Your credentials are stored.
        </div>
      )}

      {status === "error" && error && (
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to save: {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="business_description"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Business description
          </label>
          <textarea
            id="business_description"
            name="business_description"
            value={businessDescription}
            onChange={(event) => setBusinessDescription(event.target.value)}
            rows={4}
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="system_prompt"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            System prompt
          </label>
          <textarea
            id="system_prompt"
            name="system_prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            rows={6}
            className={fieldClass}
          />
        </div>

        <div className="border-t border-zinc-100 pt-5">
          <h2 className="text-sm font-semibold text-zinc-900">Twilio credentials</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Webhook URL:{" "}
            <code className="rounded bg-zinc-100 px-1">/api/webhook/twilio</code>
          </p>
        </div>

        <div>
          <label
            htmlFor="twilio_account_sid"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Account SID
          </label>
          <input
            id="twilio_account_sid"
            name="twilio_account_sid"
            value={accountSid}
            onChange={(event) => setAccountSid(event.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label
            htmlFor="twilio_auth_token"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            Auth token
            {hasAuthToken && (
              <span className="font-normal text-zinc-500">
                {" "}
                (saved — leave blank to keep)
              </span>
            )}
          </label>
          <input
            id="twilio_auth_token"
            name="twilio_auth_token"
            type="password"
            value={authToken}
            onChange={(event) => setAuthToken(event.target.value)}
            placeholder={
              hasAuthToken ? "Leave blank to keep saved token" : ""
            }
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="twilio_whatsapp_number"
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            WhatsApp number
          </label>
          <input
            id="twilio_whatsapp_number"
            name="twilio_whatsapp_number"
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="+14155238886"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
