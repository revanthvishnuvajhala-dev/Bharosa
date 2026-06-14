import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
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

          <AuthForm />
        </div>
      </div>
    </div>
  );
}
