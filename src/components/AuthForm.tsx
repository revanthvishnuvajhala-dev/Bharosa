"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  // Strip leading India country code if pasted with +91
  return digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits.slice(0, 10);
}

function normalizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function AuthForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handlePhoneChange(value: string) {
    setPhone(normalizePhone(value));
    setError("");
  }

  function handleOtpChange(value: string) {
    setOtp(normalizeOtp(value));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedPhone = normalizePhone(phone);

    if (step === "phone" && normalizedPhone.length !== 10) {
      setError("Enter a valid 10-digit Indian mobile number.");
      setLoading(false);
      return;
    }

    if (step === "otp" && otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          phone: normalizedPhone,
          otp: step === "otp" ? otp : undefined,
        }),
      });

      let data: { step?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        setError("Unexpected server response. Please try again.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (data.step === "otp") {
        setPhone(normalizedPhone);
        setStep("otp");
        return;
      }

      if (data.step === "done") {
        router.push("/feed");
        router.refresh();
        return;
      }

      setError("Unexpected response. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === "phone" ? (
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-ink-muted mb-2"
          >
            Phone number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-sand bg-sand/50 text-ink-muted text-sm">
              +91
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="flex-1 px-4 py-3 rounded-r-lg border border-sand bg-white text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              required
            />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            {phone.length}/10 digits
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">
            OTP sent to +91 {phone}. Enter the code below.
          </p>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-ink-muted mb-2"
          >
            Enter OTP sent to +91 {phone}
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-sand bg-white text-ink text-center text-2xl tracking-[0.5em] placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            required
          />
          <p className="mt-2 text-xs text-ink-muted">
            Demo mode: use OTP <span className="font-mono font-medium">123456</span>
          </p>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
            }}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Change number
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & Sign In"}
      </button>
    </form>
  );
}
