"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { registerAction, type RegisterFormState } from "../_actions";

const initialState: RegisterFormState = { error: null };

export function RegisterForm({ t }: { t: Dictionary["auth"] }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.name}</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {/* registerAction's error text is server-generated and stays French
          for now — see the i18n scope note in this commit's summary. */}
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? t.registerPending : t.registerCta}
      </Button>
      <p className="text-sm text-ink-muted">
        {t.hasAccount}{" "}
        <Link href="/connexion" className="text-pine hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </form>
  );
}
