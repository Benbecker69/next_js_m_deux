import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { withFlash } from "@/lib/feedback/flash-messages";

// A Route Handler rather than a Server Action: logging out is a plain
// mutation with no page-local UI state, triggered by a bare
// <form method="post">. POST (not a GET link) keeps it safe from browsers
// or crawlers prefetching links and logging the user out by accident.
export async function POST(request: Request) {
  await destroySession();
  // 303: the browser follows a POST's redirect with a GET.
  return NextResponse.redirect(new URL(withFlash("/", "deconnexion"), request.url), 303);
}
