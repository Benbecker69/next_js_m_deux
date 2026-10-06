"use client";

import { useState, useTransition } from "react";
import { MESSAGES, type ActionResult } from "./action-result";
import { useToast } from "./toast-provider";

/**
 * For a button that calls a Server Action directly (cancel, delete, toggle —
 * no form fields): runs it in a transition, shows the toast, and keeps the
 * last error so the caller can also display it next to the button.
 *
 * The action answers with an `ActionResult` instead of throwing (see
 * action-result.ts). The only thing that can still throw here is the request
 * itself — no network, server down — hence the `catch`.
 */
export function useRunAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      let result: ActionResult;
      try {
        result = await action();
      } catch {
        result = { ok: false, error: MESSAGES.network };
      }
      if (result.ok) {
        showSuccess(result.message);
        onSuccess?.();
      } else {
        setError(result.error);
        showError(result.error, "Action impossible");
      }
    });
  }

  return { run, pending, error, clearError: () => setError(null) };
}
