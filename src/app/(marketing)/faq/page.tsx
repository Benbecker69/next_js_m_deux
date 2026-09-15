import type { Metadata } from "next";
import { getT } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.faq.title, description: t.faq.metaDescription };
}

export default async function FaqPage() {
  const t = await getT();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">{t.faq.title}</h1>

      <div className="mt-12 divide-y divide-line border-t border-line">
        {t.faq.questions.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-ink marker:content-none">
              <span className="font-medium">{item.question}</span>
              <span className="text-ink-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
