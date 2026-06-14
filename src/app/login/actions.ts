"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_OTP } from "@/lib/constants";

function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
}

export async function sendOtp(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));

  if (phone.length !== 10) {
    redirect("/login?error=invalid-phone");
  }

  redirect(`/login?step=otp&phone=${phone}`);
}

export async function verifyOtp(formData: FormData) {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const otp = String(formData.get("otp") ?? "").replace(/\D/g, "");

  if (phone.length !== 10) {
    redirect("/login?error=invalid-phone");
  }

  if (otp !== DEMO_OTP) {
    redirect(`/login?step=otp&phone=${phone}&error=invalid-otp`);
  }

  const cookieStore = await cookies();
  const headersList = await headers();
  const isSecure = headersList.get("x-forwarded-proto") === "https";

  cookieStore.set("demo_session", `retailer-${phone}`, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect("/feed");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("demo_session");
  redirect("/login");
}
