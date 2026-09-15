"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast-provider";
import { FLASH_MESSAGES, type FlashCode } from "./flash-messages";

function isFlashCode(value: string | null): value is FlashCode {
  return value !== null && value in FLASH_MESSAGES;
}

/**
 * Mounted once in the root layout. Reads the `?ok=<code>` param a Server
 * Action's redirect() may have appended (see flash-messages.ts), shows the
 * matching toast, then strips the param so refreshing the page doesn't
 * replay it. Renders nothing itself.
 */
export function FlashToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const code = searchParams.get("ok");
  // Guards against React Strict Mode's development-only double-invoke of
  // effects (mount → cleanup → mount again, to surface non-idempotent
  // effects) — without it, one redirect would toast twice in `next dev`.
  // A ref survives that replay because it's the same component instance.
  const consumedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFlashCode(code) || consumedRef.current === code) return;
    consumedRef.current = code;

    const entry = FLASH_MESSAGES[code];
    if (entry.variant === "success") {
      showSuccess(entry.message);
    } else {
      showError(entry.message);
    }

    const params = new URLSearchParams(searchParams);
    params.delete("ok");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [code, searchParams, pathname, router, showSuccess, showError]);

  return null;
}
