"use client";

import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/feedback/use-online";

// A strip, not a toast: it has to stay for as long as the connection is
// down. Mounted once in the (app) layout, above every page — the same role
// as the mobile app's own offline banner. The pages still show what was
// loaded: this only warns that it may be stale and that actions will fail.
export function OfflineBanner({ label }: { label: string }) {
  const online = useOnline();
  if (online) return null;

  return (
    <p
      role="status"
      className="flex items-center gap-2 border-b border-danger/30 bg-danger/10 px-5 py-2 text-sm text-danger sm:px-8"
    >
      <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {label}
    </p>
  );
}
