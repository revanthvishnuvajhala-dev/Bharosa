"use client";

import { useFormStatus } from "react-dom";

export function SaveSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save settings"}
    </button>
  );
}
