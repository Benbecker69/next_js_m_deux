"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import { loginAction, type LoginFormState } from "../_actions";

const initialState: LoginFormState = { error: null };

// Real accounts from prisma/seed.ts, seeded with this exact password.
const DEMO_ACCOUNTS = {
  admin: "admin@example.com",
  member: "camille@example.com",
} as const;
const DEMO_PASSWORD = "demo1234";

// Client Component: getT() is server-only, so the Server Component parent
// (page.tsx) resolves the dictionary once and passes just the slice this
// form needs — no client-side locale plumbing required.
export function LoginForm({ t }: { t: Dictionary["auth"] }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  useActionToast(state);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Inputs are uncontrolled (no value/onChange — cheaper, and the Web
  // Interface Guidelines skill's own preference), so filling them from a
  // button means setting .value directly via ref rather than through state.
  const fillDemo = (account: keyof typeof DEMO_ACCOUNTS) => {
    if (emailRef.current) emailRef.current.value = DEMO_ACCOUNTS[account];
    if (passwordRef.current) passwordRef.current.value = DEMO_PASSWORD;
  };

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="rounded-sm border border-dashed border-line p-3">
        <p className="text-xs text-ink-muted">{t.demoAccountsLabel}</p>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fillDemo("admin")}
          >
            {t.demoAdmin}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fillDemo("member")}
          >
            {t.demoMember}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={state.email}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.password}</Label>
        <Input
          ref={passwordRef}
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
