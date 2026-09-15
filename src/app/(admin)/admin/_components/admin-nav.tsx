"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/lieux", label: "Lieux" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/reservations", label: "Réservations" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-10 flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-sm px-3 py-2 text-sm transition-colors",
              active ? "bg-pine/10 text-pine" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
