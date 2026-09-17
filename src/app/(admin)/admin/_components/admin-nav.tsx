"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Users, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Icons are chosen here, not passed down from the Server Component parent:
// Lucide components aren't plain serializable data, so they can't cross the
// server→client boundary as props (only href/label, which need translation,
// come from the server).
const ICONS = {
  "/admin": LayoutDashboard,
  "/admin/lieux": MapPin,
  "/admin/utilisateurs": Users,
  "/admin/reservations": CalendarCheck,
} as const;

export function AdminNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-10 flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
      {items.map(({ href, label }) => {
        const active =
          pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
        const Icon = ICONS[href as keyof typeof ICONS];
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
              active ? "bg-pine/10 text-pine" : "text-ink-muted hover:text-ink",
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
