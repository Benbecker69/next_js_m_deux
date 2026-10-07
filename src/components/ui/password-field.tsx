"use client";

import { type InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Accessible names of the eye button, in the page's language. */
  showLabel: string;
  hideLabel: string;
};

/**
 * A password input with a show/hide toggle — the standard way to let someone
 * check what they typed before submitting, and the same field as the mobile
 * app's. Everything else is a plain `<Input>`: `name`, `autoComplete`,
 * `aria-invalid` and the forwarded `ref` all reach the input.
 *
 * Client Component for the one bit of state (visible or not).
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ showLabel, hideLabel, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
      <div className="relative">
        {/* Right padding keeps the typed text clear of the button. */}
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          {...props}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-sm text-ink-muted transition-colors hover:text-ink"
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  },
);
PasswordField.displayName = "PasswordField";
