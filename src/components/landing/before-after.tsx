import { Check, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { Reveal } from "./reveal";

const T = {
  fr: {
    eyebrow: "Avant, après",
    title: ["Moins d'outils à gérer.", "Plus de temps pour créer."],
    without: "Sans la suite",
    with: "Avec Postmelo",
    before: ["8 comptes et 8 mots de passe", "Des outils qui ne se parlent pas", "Des données éparpillées chez des géants", "Des abonnements qui s'empilent", "Un nouvel arrivant ? Une demi-journée d'accès à créer"],
    after: ["Un compte, Face ID, et tout s'ouvre", "Le même design et la même logique partout", "Tes données chez toi", "Une suite, pilotée depuis un seul endroit", "Un nouvel arrivant ? Trois clics"],
  },
  en: {
    eyebrow: "Before, after",
    title: ["Fewer tools to manage.", "More time to create."],
    without: "Without the suite",
    with: "With Postmelo",
    before: ["8 accounts and 8 passwords", "Tools that don't talk to each other", "Data scattered across the giants", "Subscriptions piling up", "A newcomer? Half a day of access to set up"],
    after: ["One account, Face ID, and everything opens", "The same design and the same logic everywhere", "Your data stays with you", "One suite, run from a single place", "A newcomer? Three clicks"],
  },
  de: {
    eyebrow: "Vorher, nachher",
    title: ["Weniger Tools verwalten.", "Mehr Zeit zum Gestalten."],
    without: "Ohne die Suite",
    with: "Mit Postmelo",
    before: ["8 Konten und 8 Passwörter", "Tools, die nicht miteinander reden", "Daten verstreut bei den Grossen", "Abos, die sich stapeln", "Neue Mitarbeiterin? Ein halber Tag Zugänge einrichten"],
    after: ["Ein Konto, Face ID, und alles geht auf", "Überall dasselbe Design und dieselbe Logik", "Deine Daten bleiben bei dir", "Eine Suite, von einem Ort aus gesteuert", "Neue Mitarbeiterin? Drei Klicks"],
  },
};

export function BeforeAfter({ locale = "fr" }: { locale?: Locale }) {
  const t = T[locale];
  return (
    <section className="mx-auto max-w-[1160px] px-4 py-28 sm:px-6">
      <Reveal className="text-center">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-[820px] font-display text-[clamp(40px,6vw,84px)] leading-[0.92]">
          {t.title[0]}
          <br />
          <span className="italic text-ink-2">{t.title[1]}</span>
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <Reveal className="rounded-[28px] border border-line bg-[var(--glass-02)] p-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-3">{t.without}</p>
          <ul className="mt-6 flex flex-col gap-4">
            {t.before.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[16px] text-ink-3 line-through decoration-wash/20">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-wash/[0.06]">
                  <X className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={150} className="relative overflow-hidden rounded-[28px] border border-accent/30 bg-[image:var(--after-gradient)] p-8">
          <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-accent/20 blur-3xl" />
          <p className="relative text-[13px] font-medium uppercase tracking-[0.14em] text-accent">{t.with}</p>
          <ul className="relative mt-6 flex flex-col gap-4">
            {t.after.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[16px] text-ink">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
