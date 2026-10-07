"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Whether the browser has a network connection, as React state: the value
 * changes by itself when the connection drops or comes back. The browser is
 * an external store, so `useSyncExternalStore` reads it — no effect that sets
 * state. On the server there is no browser: it answers "online".
 */
export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
