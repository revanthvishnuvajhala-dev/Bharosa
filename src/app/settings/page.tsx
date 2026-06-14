import { SettingsForm } from "@/components/SettingsForm";
import { loadSettingsForUi } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { data, error } = await loadSettingsForUi();

  return <SettingsForm initialData={data} initialError={error} />;
}
