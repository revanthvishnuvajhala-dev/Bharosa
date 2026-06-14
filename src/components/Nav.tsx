import Link from "next/link";

const links = [
  { href: "/", label: "Leads" },
  { href: "/leads/new", label: "Add Lead" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            Bharosa
          </Link>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600">
            Win-Back · build 2026-06-14
          </p>
        </div>
        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
