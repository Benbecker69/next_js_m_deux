import type { Metadata } from "next";
import { getT } from "@/lib/i18n/locale";
import { RegisterForm } from "./_components/register-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.registerTitle, description: t.auth.registerSubtitle };
}

export default async function RegisterPage() {
  const t = await getT();

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">
        {t.auth.registerTitle}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t.auth.registerSubtitle}</p>
      <div className="mt-8">
        <RegisterForm t={t.auth} />
      </div>
    </div>
  );
}
