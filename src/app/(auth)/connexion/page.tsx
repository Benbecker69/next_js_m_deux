import type { Metadata } from "next";
import { getT } from "@/lib/i18n/locale";
import { LoginForm } from "./_components/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.loginTitle, description: t.auth.loginSubtitle };
}

export default async function LoginPage() {
  const t = await getT();

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">{t.auth.loginTitle}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t.auth.loginSubtitle}</p>
      <div className="mt-8">
        <LoginForm t={t.auth} />
      </div>
    </div>
  );
}
