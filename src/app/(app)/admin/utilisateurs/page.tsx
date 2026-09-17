import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { getT } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

export default async function AdminUsersPage() {
  const [, users, t] = await Promise.all([requireAdmin(), listUsers(), getT()]);
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{t.adminUsers.title}</h1>

      <ul className="mt-8 divide-y divide-line border-t border-line">
        {sorted.map((user) => (
          <li key={user.id} className="py-4">
            <Link
              href={`/admin/utilisateurs/${user.id}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink">{user.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink-muted">
                  {user.credits} {t.adminUsers.creditsSuffix}
                </span>
                <Badge variant={user.role === "admin" ? "warning" : "neutral"}>
                  {user.role === "admin"
                    ? t.adminUsers.administrator
                    : t.adminUsers.member}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
