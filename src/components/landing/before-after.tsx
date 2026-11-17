import { Check, X } from "lucide-react";
import { Reveal } from "./reveal";

const BEFORE = ["8 comptes et 8 mots de passe", "Des outils qui ne se parlent pas", "Des données éparpillées chez des géants", "Des abonnements qui s'empilent", "Un nouvel arrivant ? Une demi-journée d'accès à créer"];
const AFTER = ["Un compte, Face ID, et tout s'ouvre", "Le même design et la même logique partout", "Tes données chez toi", "Une suite, pilotée depuis un seul endroit", "Un nouvel arrivant ? Trois clics"];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-[1160px] px-4 py-28 sm:px-6">
      <Reveal className="text-center">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Avant, après</p>
        <h2 className="mx-auto mt-4 max-w-[820px] font-display text-[clamp(40px,6vw,84px)] leading-[0.92]">
          Moins d&apos;outils à gérer.
          <br />
          <span className="italic text-ink-2">Plus de temps pour créer.</span>
        </h2>
      </Reveal>
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <Reveal className="rounded-[28px] border border-line bg-[var(--glass-02)] p-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-ink-3">Sans la suite</p>
          <ul className="mt-6 flex flex-col gap-4">
            {BEFORE.map((t) => (
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
          <p className="relative text-[13px] font-medium uppercase tracking-[0.14em] text-accent">Avec Postmelo</p>
          <ul className="relative mt-6 flex flex-col gap-4">
            {AFTER.map((t) => (
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
