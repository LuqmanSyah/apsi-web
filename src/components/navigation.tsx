"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/src/lib/store";

const publicLinks = [
  { href: "/", label: "Beranda" },
  { href: "/studios", label: "Studio" },
  { href: "/booking", label: "Booking" },
];

const userLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/booking", label: "Booking" },
  { href: "/my-bookings", label: "Booking Saya" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/studios", label: "Studio" },
  { href: "/admin/instruments", label: "Alat Musik" },
  { href: "/admin/bookings", label: "Booking" },
  { href: "/admin/payments", label: "Pembayaran" },
  { href: "/admin/reports", label: "Laporan" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function PublicNav() {
  const { session, logout } = useSession();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-black tracking-normal text-zinc-950">
          Harmoni<span className="text-teal-600">.</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {publicLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {session ? (
            <>
              <Link
                href={session.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Masuk Panel
              </Link>
              <button
                className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function UserLayout({ children }: { children: ReactNode }) {
  const { session, logout } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-lg font-black text-zinc-950">
            Harmoni Studio
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {userLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
            <span className="hidden px-3 text-sm text-zinc-500 sm:inline">
              {session?.nama ?? "Pelanggan"}
            </span>
            <button
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-zinc-200 bg-zinc-950 p-4 text-white lg:min-h-screen lg:border-b-0">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-xl font-black">
            Harmoni Admin
          </Link>
          <p className="mt-1 text-sm text-zinc-400">Panel pemilik studio</p>
        </div>
        <nav className="grid gap-1">
          {adminLinks.map((link) => (
            <AdminNavLink key={link.href} {...link} />
          ))}
        </nav>
        <button
          className="mt-6 w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </aside>
      <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-teal-500 text-zinc-950" : "text-zinc-300 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}
