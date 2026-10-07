"use client";

import { useEffect, useState } from "react";

/** "unknown" until the browser has answered: show no permission UI for it. */
export type GeoPermissionState = "unknown" | "granted" | "prompt" | "denied";

/**
 * Whether this site may use the visitor's location — and nothing else: it
 * never reads a position on its own. The web twin of the mobile app's
 * `useLocationPermission`.
 *
 * The Permissions API answers without showing any prompt, and fires `change`
 * when the visitor allows or blocks the site from the browser's own settings,
 * so the page follows without a reload. `request()` is the only thing that
 * can make the browser ask, and must be called from a click.
 */
export function useGeoPermission() {
  const [state, setState] = useState<GeoPermissionState>("unknown");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let status: PermissionStatus | null = null;
    const update = () => {
      if (!cancelled && status) setState(status.state);
    };

    // A browser without the Permissions API cannot be asked silently: treat
    // it as "not asked yet", the click will tell.
    const query = navigator.permissions?.query({ name: "geolocation" });
    (query ?? Promise.reject(new Error("unsupported")))
      .then((result) => {
        status = result;
        update();
        result.addEventListener("change", update);
      })
      .catch(() => {
        if (!cancelled) setState("prompt");
      });

    return () => {
      cancelled = true;
      status?.removeEventListener("change", update);
    };
  }, []);

  const request = () => {
    if (!("geolocation" in navigator)) {
      setState("denied");
      return;
    }
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setRequesting(false);
        setState("granted");
      },
      (error) => {
        setRequesting(false);
        // Any failure other than a refusal means the permission itself was
        // given (no GPS fix, timeout): the map can be shown.
        setState(error.code === error.PERMISSION_DENIED ? "denied" : "granted");
      },
      { timeout: 10_000 },
    );
  };

  return { state, requesting, request };
}
