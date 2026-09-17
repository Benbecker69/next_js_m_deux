import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";
import { AdminTabs } from "./_components/admin-tabs";

// No sidebar of its own: admin pages live under the same persistent
// (app) layout and left nav as the rest of the member area (see
// src/app/(app)/layout.tsx) — this only adds the admin-only guard and a
// local tab bar for the four admin sections, exactly like
// parametres/layout.tsx does for its own sub-pages.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [, t] = await Promise.all([requireAdmin(), getT()]);

  const TABS = [
    { href: "/admin", label: t.adminNav.overview },
    { href: "/admin/lieux", label: t.adminNav.locations },
    { href: "/admin/utilisateurs", label: t.adminNav.users },
    { href: "/admin/reservations", label: t.adminNav.reservations },
  ];

  return (
    <>
      <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8 sm:pt-12">
        <AdminTabs tabs={TABS} />
      </div>
      {children}
    </>
  );
}
