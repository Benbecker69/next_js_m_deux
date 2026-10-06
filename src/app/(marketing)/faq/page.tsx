import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { getT } from "@/lib/i18n/locale";
import { CtaBand } from "../_components/cta-band";
import { PageIntro } from "../_components/section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.faq.title, description: t.faq.metaDescription };
}

export default async function FaqPage() {
  const t = await getT();

  return (
    <>
      <PageIntro title={t.faq.title} lead={t.faq.metaDescription} />

      <div className="mx-auto max-w-3xl px-6 py-14">
        {/* Native <details>: opens with the keyboard and without JavaScript.
            The first one is open so the page does not look like a list of
            closed doors. */}
        <div className="divide-y divide-line rounded-sm border border-line bg-surface">
          {t.faq.questions.map((item, index) => (
            <details key={item.question} className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:content-none">
                <h2 className="font-medium text-ink">{item.question}</h2>
                <Plus
                  className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-45"
                  strokeWidth={1.75}
                />
              </summary>
              <p className="px-5 pb-5 text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <CtaBand />
    </>
  );
}
