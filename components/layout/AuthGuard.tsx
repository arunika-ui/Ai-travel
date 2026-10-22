"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/trips/types";
import { getCurrentUser } from "@/lib/trips/auth";

export function AuthGuard({
  requireAdmin,
  children,
}: {
  requireAdmin?: boolean;
  children: (user: User) => React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current || (requireAdmin && current.role !== "admin")) {
      router.replace("/login");
      return;
    }
    setUser(current);
  }, [router, requireAdmin]);

  if (user === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-center text-slate-500">Loading...</div>;
  }
  if (!user) return null;
  return <>{children(user)}</>;
}
