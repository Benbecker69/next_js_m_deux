"use client";

import { useEffect } from "react";
import { useToast } from "./toast-provider";

/**
 * Fires a toast whenever a `useActionState` result changes to an error or a
 * success — covers every form that stays on the same page after submitting
 * (an action that redirects instead uses the flash-message pattern, see
 * flash-messages.ts). Safe to call with the hook's initial state: it only
 * reacts to *changes*, and the initial `{error: null, success: false}} never
 * matches either branch, so nothing fires before a real submission.
 */
export function useActionToast(
  state: { error: string | null; success?: boolean },
  successMessage?: string,
) {
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (state.error) {
      showError(state.error);
    } else if (state.success && successMessage) {
      showSuccess(successMessage);
    }
    // Only re-run when the action actually produced a new result — state is
    // a fresh object each time useActionState resolves, so this can't miss
    // a repeat error/success with the same text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
