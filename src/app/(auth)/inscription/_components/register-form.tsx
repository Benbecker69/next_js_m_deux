"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/ui/password-field";
import { Alert } from "@/components/ui/alert";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import { registerAction, type RegisterFormState } from "../_actions";

const initialState: RegisterFormState = { error: null };

export function RegisterForm({
  t,
  passwordLabels,
}: {
  t: Dictionary["auth"];
  passwordLabels: { show: string; hide: string };
}) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  useActionToast(state);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t.name}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={state.values?.name}
          required
          {...fieldProps("name", errors?.name)}
        />
        <FieldError field="name" message={errors?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          defaultValue={state.values?.email}
          required
          {...fieldProps("email", errors?.email)}
        />
        <FieldError field="email" message={errors?.email} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t.password}</Label>
        <PasswordField
          id="password"
          name="password"
          autoComplete="new-password"
          showLabel={passwordLabels.show}
          hideLabel={passwordLabels.hide}
          required
          aria-describedby={errors?.password ? "password-error" : "password-hint"}
          aria-invalid={errors?.password ? true : undefined}
        />
        {errors?.password ? (
          <FieldError field="password" message={errors.password} />
        ) : (
          <p id="password-hint" className="text-xs text-ink-muted">
            {t.passwordHint}
          </p>
        )}
      </div>
      {/* registerAction's messages are written on the server, in French. A
          field error is already shown under its field. */}
      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? t.registerPending : t.registerCta}
      </Button>
      <p className="text-sm text-ink-muted">
        {t.hasAccount}{" "}
        <Link
          href="/connexion"
          className="text-pine underline underline-offset-2 hover:no-underline"
        >
          {t.loginLink}
        </Link>
      </p>
    </form>
  );
}
