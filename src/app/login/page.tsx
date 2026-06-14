import Link from "next/link";
import { sendOtp, verifyOtp } from "./actions";
import { DEMO_OTP } from "@/lib/constants";

const errors: Record<string, string> = {
  "invalid-phone": "Enter a valid 10-digit Indian mobile number.",
  "invalid-otp": `Invalid OTP. Demo mode uses ${DEMO_OTP}.`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; phone?: string; error?: string }>;
}) {
  const params = await searchParams;
  const phone = (params.phone ?? "").replace(/\D/g, "").slice(0, 10);
  const step =
    params.step === "otp" && phone.length === 10 ? "otp" : "phone";
  const error = params.error ? errors[params.error] : null;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-ink items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="editorial-title text-5xl font-semibold text-cream mb-4">
            Bharosa
          </h1>
          <p className="text-cream/70 text-lg leading-relaxed">
            Celebrity-driven apparel trend intelligence for Indian menswear
            retailers. Know what to stock before it peaks.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="editorial-title text-3xl font-semibold text-ink">
              Bharosa
            </h1>
            <p className="text-ink-muted text-sm mt-2">
              Menswear trend intelligence
            </p>
          </div>

          <h2 className="text-xl font-semibold text-ink mb-1">
            Sign in with phone
          </h2>
          <p className="text-sm text-ink-muted mb-8">
            New numbers are registered automatically. Free for all retailers.
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6">
              {error}
            </p>
          )}

          {step === "phone" ? (
            <form action={sendOtp} className="space-y-6">
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
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="9876543210"
                    defaultValue={phone}
                    className="flex-1 px-4 py-3 rounded-r-lg border border-sand bg-white text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors"
              >
                Send OTP
              </button>
            </form>
          ) : (
            <form action={verifyOtp} className="space-y-6">
              <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                OTP sent to +91 {phone}. Enter the code below.
              </p>

              <input type="hidden" name="phone" value={phone} />

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-ink-muted mb-2"
                >
                  Enter OTP sent to +91 {phone}
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-lg border border-sand bg-white text-ink text-center text-2xl tracking-[0.5em] placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  required
                />
                <p className="mt-2 text-xs text-ink-muted">
                  Demo mode: use OTP{" "}
                  <span className="font-mono font-medium">{DEMO_OTP}</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-ink text-cream rounded-lg font-medium hover:bg-ink/90 transition-colors"
              >
                Verify & Sign In
              </button>

              <Link
                href="/login"
                className="block text-center text-sm text-accent hover:underline"
              >
                Change number
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
