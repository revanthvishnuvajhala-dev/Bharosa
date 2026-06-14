import { NextRequest, NextResponse } from "next/server";
import { DEMO_OTP } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { phone, otp } = await request.json();

  if (!phone) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/\D/g, "");

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Auth unavailable" },
        { status: 500 }
      );
    }

    if (!otp) {
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${normalizedPhone}`,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ step: "otp" });
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${normalizedPhone}`,
      token: otp,
      type: "sms",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ step: "done" });
  }

  // Demo mode
  if (!otp) {
    return NextResponse.json({ step: "otp" });
  }

  if (otp !== DEMO_OTP) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  const response = NextResponse.json({ step: "done" });
  response.cookies.set("demo_session", `retailer-${normalizedPhone}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("demo_session");
  return response;
}
