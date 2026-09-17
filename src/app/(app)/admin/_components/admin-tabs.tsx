"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Users, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Same segmented-control treatment as the settings tabs (see
// parametres/_components/settings-tabs.tsx) — one persistent navigation
// language reused for every sub-section, member or admin, instead of a
// second sidebar that would replace the main one.
const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/lieux": MapPin,
  "/admin/utilisateurs": Users,
  "/admin/reservations": CalendarCheck,
} as const;

export function AdminTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="inline-flex flex-wrap items-center gap-1 rounded-sm border border-line bg-paper p-1">
      {tabs.map(({ href, label }) => {
        const active =
          pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
        const Icon = ICONS[href as keyof typeof ICONS];
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors",
              active ? "bg-surface text-pine shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
