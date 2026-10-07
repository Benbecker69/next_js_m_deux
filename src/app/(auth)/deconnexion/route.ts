import { destroySession } from "@/lib/auth/session";
import { withFlash } from "@/lib/feedback/flash-messages";

// A Route Handler rather than a Server Action: logging out is a plain
// mutation with no page-local UI state, triggered by a bare
// <form method="post">. POST (not a GET link) keeps it safe from browsers
// or crawlers prefetching links and logging the user out by accident.
export async function POST() {
  await destroySession();
  // 303: the browser follows a POST's redirect with a GET.
  // A relative `Location`, resolved by the browser against the address it is
  // already on. Building an absolute URL from `request.url` breaks in the
  // Docker image: there the server listens on 0.0.0.0, so the redirect pointed
  // to http://0.0.0.0:3000, which no browser can open.
  return new Response(null, {
    status: 303,
    headers: { Location: withFlash("/", "deconnexion") },
  });
}
