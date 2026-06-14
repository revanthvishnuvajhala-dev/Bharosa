import { SettingsForm } from "@/components/SettingsForm";
import { loadSettingsForUi } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data, error } = await loadSettingsForUi();

  return (
    <SettingsForm
      key={`${data?.twilio_account_sid ?? ""}-${data?.has_auth_token ?? false}`}
      initialData={data}
      initialError={error}
    />
  );
}
