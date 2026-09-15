type ClassValue = string | number | null | undefined | false | ClassValue[];

/**
 * Joins class names, dropping falsy values. No conflict-resolution (no
 * tailwind-merge) — kept deliberately simple; avoid passing conflicting
 * utilities (e.g. two different `p-*`) to the same className.
 */
export function cn(...values: ClassValue[]): string {
  const flat: string[] = [];
  const walk = (value: ClassValue) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    flat.push(String(value));
  };
  values.forEach(walk);
  return flat.join(" ");
}
