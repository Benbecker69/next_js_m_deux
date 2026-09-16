"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { loginAction, type LoginFormState } from "../_actions";

const initialState: LoginFormState = { error: null };

// Client Component: getT() is server-only, so the Server Component parent
// (page.tsx) resolves the dictionary once and passes just the slice this
// form needs — no client-side locale plumbing required.
export function LoginForm({ t }: { t: Dictionary["auth"] }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {/* loginAction's error text is server-generated and stays French for
          now — see the i18n scope note in this commit's summary. */}
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? t.loginPending : t.loginCta}
      </Button>
      <p className="text-sm text-ink-muted">
        {t.noAccount}{" "}
        <Link href="/inscription" className="text-pine hover:underline">
          {t.signupLink}
        </Link>
      </p>
    </form>
  );
}
