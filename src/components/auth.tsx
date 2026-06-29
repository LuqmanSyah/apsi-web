"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/src/lib/store";
import type { UserRole } from "@/src/types";

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { session, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session || session.role !== role) router.replace("/login");
  }, [ready, role, router, session]);

  if (!ready) {
    return <div className="p-8 text-sm text-zinc-500">Memuat sesi...</div>;
  }

  if (!session || session.role !== role) return null;

  return children;
}
