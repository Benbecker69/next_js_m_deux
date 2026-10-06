import { CircleAlert } from "lucide-react";

/**
 * The message under a form field. Renders nothing when there is no error, so
 * a form can place one after every field unconditionally:
 *
 *   <Input id="email" name="email" {...fieldProps("email", errors?.email)} />
 *   <FieldError field="email" message={errors?.email} />
 *
 * `field` is the control's `id`: both helpers derive the same `<id>-error`
 * from it, which is what links the message to the control for a screen
 * reader (`aria-describedby`).
 */
export function FieldError({ field, message }: { field: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={`${field}-error`}
      className="animate-toast-in flex items-start gap-1.5 text-xs text-danger"
    >
      <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      <span>{message}</span>
    </p>
  );
}

/** The two attributes a control needs when its field is in error. */
export function fieldProps(field: string, message?: string) {
  return {
    "aria-invalid": message ? true : undefined,
    "aria-describedby": message ? `${field}-error` : undefined,
  };
}
