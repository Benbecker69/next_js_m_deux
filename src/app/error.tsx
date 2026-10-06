"use client";

// Root-level error boundary — the safety net for any route whose own group
// has no error.tsx (auth, onboarding, /qrcode). Must be a Client Component:
// Next.js passes it `retry`, a function that runs in the browser.
import { ErrorScreen } from "@/components/error-screen";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorScreen error={error} retry={retry} fullPage />;
}
