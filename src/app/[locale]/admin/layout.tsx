import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/announcements", label: "Annonces" },
    { href: "/admin/events", label: "Événements" },
    { href: "/admin/settings", label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop / Topbar mobile */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-gray-900">🕌 Admin</span>
            <div className="hidden sm:flex gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Mobile nav */}
        <div className="flex sm:hidden gap-4 mt-3 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}
