"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: step === "otp" ? otp : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      if (data.step === "otp") {
        setStep("otp");
        return;
      }

      router.push("/feed");
      router.refresh();
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
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 rounded-r-lg border border-sand bg-white text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              required
              minLength={10}
              maxLength={10}
            />
          </div>
        </div>
      ) : (
        <div>
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
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-sand bg-white text-ink text-center text-2xl tracking-[0.5em] placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            required
            minLength={6}
            maxLength={6}
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
