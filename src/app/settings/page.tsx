import { VerificationBox } from "@/components/VerificationBox";
import { SaveSettingsButton } from "@/components/SaveSettingsButton";
import { loadSettingsForUi } from "@/lib/settings";
import { saveSettings } from "./actions";

export const dynamic = "force-dynamic";

const DEFAULT_SYSTEM_PROMPT = `You are a warm, empathetic shopkeeper reaching out to lapsed customers on WhatsApp.
Your goal is to win them back with genuine care — never pushy or salesy.
Keep every message to one or two short lines, like a real text from a local shop owner.`;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { data, error } = await loadSettingsForUi();

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Could not load settings</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure your business, bot personality, and Twilio credentials.
        </p>
      </div>

      {params.saved === "1" && (
        <div className="max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Settings saved successfully. Your credentials are stored.
        </div>
      )}

      {params.error && (
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to save: {decodeURIComponent(params.error)}
        </div>
      )}

      <form
        action={saveSettings}
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
            defaultValue={data?.business_description ?? ""}
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
            defaultValue={data?.system_prompt || DEFAULT_SYSTEM_PROMPT}
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
            defaultValue={data?.twilio_account_sid ?? ""}
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
            {data?.has_auth_token && (
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
            placeholder={data?.has_auth_token ? "Leave blank to keep saved token" : ""}
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
            defaultValue={data?.twilio_whatsapp_number ?? ""}
            placeholder="+14155238886"
            className={fieldClass}
          />
        </div>

        <SaveSettingsButton />
      </form>

      <div className="max-w-2xl">
        <VerificationBox />
      </div>
    </div>
  );
}
