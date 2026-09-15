"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error";
type ToastItem = { id: number; variant: ToastVariant; message: string };

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 5000;

/**
 * App-wide toast stack, mounted once in the root layout. Covers the cases a
 * page-local <Alert> can't: an action that redirects to a new page (see
 * FlashToast) and a confirm-panel that unmounts the moment its mutation
 * succeeds (cancel/toggle/delete buttons) — the panel is gone before a local
 * "success" state could ever render, but this provider lives above it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, variant, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showSuccess: (message) => push("success", message),
      showError: (message) => push("error", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const isError = toast.variant === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-sm border bg-surface px-4 py-3 text-sm shadow-sm",
        "animate-toast-in",
        isError ? "border-danger/30" : "border-pine/30",
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", isError ? "text-danger" : "text-pine")}
        strokeWidth={1.75}
      />
      <p className="flex-1 text-ink">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer cette notification"
        className="text-ink-muted transition-colors hover:text-ink"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
