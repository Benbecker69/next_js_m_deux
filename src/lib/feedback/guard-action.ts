import "server-only";
import { unstable_rethrow } from "next/navigation";
import { MESSAGES } from "./action-result";

/**
 * Runs the body of a Server Action and turns anything unforeseen (database
 * unreachable, a constraint we did not anticipate) into a clear message
 * instead of the error page. `redirect()` and `notFound()` work by throwing:
 * `unstable_rethrow` lets those through untouched. The real error stays in
 * the server log; the user only ever sees `MESSAGES.unexpected`.
 */
export async function guardAction<T>(
  run: () => Promise<T>,
  onFailure: (message: string) => T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[action]", error);
    return onFailure(MESSAGES.unexpected);
  }
}
