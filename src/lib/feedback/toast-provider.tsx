"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error";
type ToastItem = { id: number; variant: ToastVariant; title?: string; message: string };

type ToastContextValue = {
  /** `title` is optional: a short bold line above the message. */
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// An error has to be read and acted on, a confirmation only noticed.
const DISMISS_MS: Record<ToastVariant, number> = { success: 4500, error: 9000 };
// Older toasts drop off the top so the stack never covers the page.
const MAX_VISIBLE = 3;

/**
 * App-wide toast stack, mounted once in the root layout. Covers the cases a
 * page-local <Alert> can't: an action that redirects to a new page (see
 * FlashToast) and a confirm-panel that unmounts the moment its mutation
 * succeeds (cancel/toggle/delete buttons) — the panel is gone before a local
 * "success" state could ever render, but this provider lives above it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, title?: string) => {
      const id = nextId.current++;
      setToasts((current) => {
        // Clicking twice on a failing button must not stack the same text.
        const others = current.filter(
          (toast) => !(toast.variant === variant && toast.message === message),
        );
        return [...others, { id, variant, title, message }].slice(-MAX_VISIBLE);
      });
      setTimeout(() => dismiss(id), DISMISS_MS[variant]);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showSuccess: (message, title) => push("success", message, title),
      showError: (message, title) => push("error", message, title),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4 md:top-auto md:bottom-0 md:items-end">
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
      // "alert" interrupts a screen reader, "status" waits for a pause.
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border border-l-4 bg-surface px-4 py-3 text-sm shadow-md",
        "animate-toast-in",
        isError ? "border-danger/30 border-l-danger" : "border-pine/30 border-l-pine",
      )}
    >
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", isError ? "text-danger" : "text-pine")}
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex-1">
        {toast.title && <p className="font-medium text-ink">{toast.title}</p>}
        <p
          className={cn(
            "break-words",
            toast.title ? "mt-0.5 text-ink-muted" : "text-ink",
          )}
        >
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer cette notification"
        className="-m-1 rounded-sm p-1 text-ink-muted transition-colors hover:text-ink"
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
