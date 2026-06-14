"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LogOut, TrendingUp } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { href: "/feed", label: "Trends", icon: TrendingUp },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="editorial-title text-2xl font-semibold text-ink">
              Bharosa
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-widest text-ink-muted">
              Menswear Intel
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink text-cream"
                      : "text-ink-muted hover:text-ink hover:bg-sand/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-sand/60 transition-colors"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
