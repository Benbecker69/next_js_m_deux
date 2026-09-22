import "server-only";
import { ZodError } from "zod";

// Small helpers shared by every mobile Route Handler: one JSON error shape,
// one place that turns a thrown error into a response.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// no-store: these responses are per-user and must never be cached by a proxy.
const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: BASE_HEADERS });
}

export function noContent(): Response {
  return new Response(null, { status: 204, headers: BASE_HEADERS });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return json({ error: { code: error.code, message: error.message } }, error.status);
  }
  if (error instanceof ZodError) {
    return json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.issues[0]?.message ?? "Requête invalide.",
        },
      },
      422,
    );
  }
  // Never leak internals to the client; the details stay in the server log.
  console.error("[mobile-api] unexpected error", error);
  return json(
    { error: { code: "INTERNAL_ERROR", message: "Erreur interne du serveur." } },
    500,
  );
}

/** Runs a handler body and converts any thrown ApiError / ZodError into a JSON response. */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    return errorResponse(error);
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Corps de requête JSON invalide.");
  }
}

/** Query-string values as an object, ignoring absent and empty ones. */
export function queryParams(request: Request): Record<string, string> {
  const url = new URL(request.url);
  return Object.fromEntries([...url.searchParams].filter(([, value]) => value !== ""));
}
