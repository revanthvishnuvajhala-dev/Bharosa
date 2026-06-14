import { createServiceClient } from "@/lib/supabase/server";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRedemptionCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

export async function generateUniqueRedemptionCode(): Promise<string> {
  const supabase = createServiceClient();

  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateRedemptionCode();
    const { data } = await supabase
      .from("leads")
      .select("id")
      .eq("redemption_code", code)
      .maybeSingle();

    if (!data) return code;
  }

  throw new Error("Failed to generate unique redemption code");
}
