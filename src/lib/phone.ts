import { parsePhoneNumber, type CountryCode } from "libphonenumber-js";

export function normalizeMobile(
  mobile: string,
  defaultCountry: CountryCode = "IN",
): string | null {
  const trimmed = mobile.trim();
  if (!trimmed) return null;

  try {
    const parsed = trimmed.startsWith("+")
      ? parsePhoneNumber(trimmed)
      : parsePhoneNumber(trimmed, defaultCountry);

    if (!parsed || !parsed.isValid()) return null;
    return parsed.format("E.164");
  } catch {
    return null;
  }
}

export function twilioWhatsAppAddress(e164: string): string {
  return e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;
}
