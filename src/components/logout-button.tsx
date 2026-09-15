import { LogOut } from "lucide-react";

/**
 * Compact icon button, not a text "Déconnexion" pill — matches the other
 * square icon controls in the header/sidebars (theme toggle, language
 * picker). Pure CSS hover (turns danger-red) and a native `title` tooltip;
 * no client JS needed, so this stays server-renderable.
 */
export function LogoutButton({ label }: { label: string }) {
  return (
    <form action="/deconnexion" method="post">
      <button
        type="submit"
        aria-label={label}
        title={label}
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-ink-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </form>
  );
}
