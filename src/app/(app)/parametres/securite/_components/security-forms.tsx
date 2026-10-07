"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError, fieldProps } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/ui/password-field";
import { useActionToast } from "@/lib/feedback/use-action-toast";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";
import {
  changeEmailAction,
  changePasswordAction,
  type EmailFormState,
  type PasswordFormState,
} from "../_actions";

type Labels = Dictionary["member"]["account"] & {
  saving: string;
  passwordHint: string;
};

const initialEmail: EmailFormState = { error: null, success: false };
const initialPassword: PasswordFormState = { error: null, success: false };

// Two independent forms, each with its own Server Action and its own state:
// changing the address must not submit, validate or clear the password form.
//
// After a success the action returns a fresh `resetKey`, used as the form's
// `key`: React then mounts a new, empty form — the passwords typed are gone
// from the page without a line of state to clear them.

export function EmailForm({ currentEmail, t }: { currentEmail: string; t: Labels }) {
  const [state, formAction, pending] = useActionState(changeEmailAction, initialEmail);
  useActionToast(state, t.emailChanged);
  const errors = state.fieldErrors;

  return (
    <form
      key={state.resetKey}
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="text-sm text-ink-muted">
        {t.currentEmail} <span className="font-medium text-ink">{currentEmail}</span>
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t.newEmail}</Label>
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
        <Label htmlFor="email-current-password">{t.currentPassword}</Label>
        <PasswordField
          id="email-current-password"
          name="currentPassword"
          autoComplete="current-password"
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
          required
          aria-invalid={errors?.currentPassword ? true : undefined}
          aria-describedby={
            errors?.currentPassword
              ? "email-current-password-error"
              : "email-current-password-hint"
          }
        />
        {errors?.currentPassword ? (
          <FieldError field="email-current-password" message={errors.currentPassword} />
        ) : (
          <p id="email-current-password-hint" className="text-xs text-ink-muted">
            {t.currentPasswordHint}
          </p>
        )}
      </div>

      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.changeEmail}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm({ t }: { t: Labels }) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialPassword,
  );
  useActionToast(state, t.passwordChanged);
  const errors = state.fieldErrors;

  const field = (
    name: "currentPassword" | "newPassword" | "confirmPassword",
    label: string,
    autoComplete: "current-password" | "new-password",
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <PasswordField
        id={name}
        name={name}
        autoComplete={autoComplete}
        showLabel={t.showPassword}
        hideLabel={t.hidePassword}
        required
        aria-invalid={errors?.[name] ? true : undefined}
        aria-describedby={
          errors?.[name] ? `${name}-error` : hint ? `${name}-hint` : undefined
        }
      />
      {errors?.[name] ? (
        <FieldError field={name} message={errors[name]} />
      ) : (
        hint && (
          <p id={`${name}-hint`} className="text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );

  return (
    <form
      key={state.resetKey}
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
    >
      {field("currentPassword", t.currentPassword, "current-password")}
      {field("newPassword", t.newPassword, "new-password", t.passwordHint)}
      {field("confirmPassword", t.confirmPassword, "new-password")}

      {state.error && !errors && <Alert variant="error">{state.error}</Alert>}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? t.saving : t.changePassword}
        </Button>
      </div>
    </form>
  );
}
