import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";

export const metadata: Metadata = {
  title: "Utilisateurs",
};

export default async function AdminUsersPage() {
  const [, users] = await Promise.all([requireAdmin(), listUsers()]);
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">Utilisateurs</h1>

      <ul className="mt-8 divide-y divide-line border-t border-line">
        {sorted.map((user) => (
          <li key={user.id} className="py-4">
            <Link
              href={`/admin/utilisateurs/${user.id}`}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm text-ink">{user.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink-muted">{user.credits} crédits</span>
                <Badge variant={user.role === "admin" ? "warning" : "neutral"}>
                  {user.role === "admin" ? "Administrateur" : "Membre"}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
