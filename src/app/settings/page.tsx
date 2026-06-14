import { VerificationBox } from "@/components/VerificationBox";
import { SettingsForm } from "@/components/SettingsForm";
import { loadSettingsForUi } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <div className="max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Could not load settings</p>
          <p className="mt-1">No settings record found in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure your business, bot personality, and Twilio credentials.
        </p>
      </div>

      <SettingsForm initialData={data} />

      <div className="max-w-2xl">
        <VerificationBox />
      </div>
    </div>
  );
}
