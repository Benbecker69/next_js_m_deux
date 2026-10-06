"use client";

// Inside the public layout: header and footer stay in place.
import { ErrorScreen } from "@/components/error-screen";

export default function MarketingError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorScreen error={error} retry={retry} />;
}
