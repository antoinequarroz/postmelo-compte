import { ArrowRight } from "lucide-react";
import { ProductIcon } from "@/components/product-icon";
import { PRODUCT_STATUS_LABEL } from "@/lib/crm-labels";
import { appColor, readable } from "./color";
import { Reveal } from "./reveal";

export type SuiteApp = { id: string; name: string; color: string; status: string };

/** The name of an app as the catalogue writes it. */
type Names = (id: string) => string;

/**
 * Who the suite is for: the problem each one has, what the suite changes, and the apps they open.
 * The answer names its apps, so a profile is shown only when all of them are in the catalogue.
 */
const PROFILES: { title: string; problem: string; answer: (n: Names) => string; apps: string[] }[] = [
  {
    title: "Agences et studios créatifs",
    problem: "Les retours clients arrivent sur WhatsApp, les briefs dorment dans les mails et les accès traînent dans un tableur.",
    answer: (n) => `Chaque client a son canal dans ${n("lamio")}, son brief et ses accès dans ${n("cairn")}, ses tâches dans ${n("tickup")}. Ses posts se préparent et se programment dans ${n("metricove")}.`,
    apps: ["lamio", "cairn", "tickup", "metricove"],
  },
  {
    title: "Médias, podcasts et vidéo",
    problem: "Un épisode, c'est un invité à caler, un tournage à réaliser et dix extraits à publier, chacun dans un outil différent.",
    answer: (n) => `L'invité réserve son créneau dans ${n("alfred")}, ${n("nino")} réalise le tournage, ${n("maya")} le diffuse et ${n("metricove")} programme les extraits et les Shorts sur tous tes comptes.`,
    apps: ["alfred", "nino", "maya", "metricove"],
  },
  {
    title: "PME et petites équipes",
    problem: "Huit abonnements, huit mots de passe, et plus personne ne sait très bien qui a accès à quoi.",
    answer: () => "Une messagerie, des notes, des projets et un agenda, avec un seul compte par personne. Un nouvel arrivant est prêt en trois clics.",
    apps: ["lamio", "cairn", "tickup", "alfred"],
  },
];

/** "À quoi ça sert": three teams the suite is made for, each with the apps it uses. */
export function Profiles({ apps, suite }: { apps: SuiteApp[]; suite: string }) {
  const byId = new Map(apps.map((a) => [a.id, a]));
  const names: Names = (id) => byId.get(id)?.name ?? id;
  const profiles = PROFILES.filter((p) => p.apps.every((id) => byId.has(id)));
  if (profiles.length === 0) return null;
  return (
    <section id="pour-qui" className="relative scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-4 pb-8 pt-20 sm:px-6 lg:pt-12">
        {/* On wide screens the intro sits beside the title, so the three teams show up on the second screen. */}
        <Reveal className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-12">
          <div>
            <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">À quoi ça sert</p>
            <h2 className="mt-4 max-w-[1000px] font-display text-[clamp(42px,6.4vw,92px)] leading-[0.92] tracking-[-0.012em] lg:text-[clamp(64px,5.6vw,84px)]">
              Pour les petites équipes
              <br />
              <span className="italic text-ink-2">
                qui font tout <span className="whitespace-nowrap">elles-mêmes.</span>
              </span>
            </h2>
          </div>
          <p className="mt-7 max-w-[560px] text-[16.5px] leading-relaxed text-ink-2 lg:mt-0 lg:pb-1.5">
            Parler, noter, organiser, recevoir, tourner, publier. {suite} réunit les outils de ta semaine dans une seule suite, avec un seul compte. Voici à quoi elle sert, selon qui tu es.
          </p>
        </Reveal>

        <ul className={`mt-12 grid gap-5 lg:mt-10 ${profiles.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {profiles.map((p, n) => {
            const used = p.apps.map((id) => byId.get(id)).filter((a): a is SuiteApp => !!a);
            const [c1, c2] = [appColor(used[0]?.color), appColor(used[1]?.color ?? used[0]?.color)];
            return (
              <Reveal
                as="li"
                key={p.title}
                delay={n * 120}
                className="group relative flex flex-col overflow-hidden rounded-[28px] border border-line bg-[var(--glass-025)] p-7 shadow-[var(--shadow)] transition-[border-color,background-color] duration-500 hover:border-line-strong hover:bg-[var(--glass-04)] sm:p-8"
              >
                {/* The colours of its apps, as a soft light in the corner. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full opacity-70 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${c1} 26%, transparent), transparent), radial-gradient(closest-side at 30% 70%, color-mix(in oklab, ${c2} 22%, transparent), transparent)` }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-3 tabular">{String(n + 1).padStart(2, "0")}</span>
                  <span className="flex -space-x-1.5">
                    {used.map((a, i) => (
                      <span key={a.id} className="rounded-[10px] ring-[3px] ring-[var(--bg)] transition-transform duration-500 group-hover:-translate-y-1" style={{ transitionDelay: `${i * 50}ms`, zIndex: used.length - i }}>
                        <ProductIcon id={a.id} color={a.color} size="sm" className="size-8 rounded-[10px]" />
                      </span>
                    ))}
                  </span>
                </div>
                <h3 className="relative mt-8 text-balance font-display text-[clamp(32px,3vw,40px)] leading-[0.98]">{p.title}</h3>

                <p className="relative mt-5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink-3">Aujourd&apos;hui</p>
                <p className="relative mt-2 text-[15px] leading-relaxed text-ink-3">{p.problem}</p>

                <div aria-hidden className="relative my-6 h-px bg-line" />

                <p className="relative text-[11.5px] font-medium uppercase tracking-[0.14em] text-accent">Avec {suite}</p>
                <p className="relative mt-2 text-[15.5px] leading-relaxed text-ink">{p.answer(names)}</p>

                <ul className="relative mt-auto flex flex-wrap gap-2 pt-7">
                  {used.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[12.5px] font-medium"
                      style={{ borderColor: `color-mix(in oklab, ${appColor(a.color)} 22%, transparent)`, background: `color-mix(in oklab, ${appColor(a.color)} 7%, transparent)`, color: readable(appColor(a.color)) }}
                    >
                      <ProductIcon id={a.id} color={a.color} size="sm" className="size-6 rounded-full" />
                      {a.name}
                      {a.status !== "disponible" && PRODUCT_STATUS_LABEL[a.status] && <span className="text-[11px] font-normal text-ink-3">{PRODUCT_STATUS_LABEL[a.status]}</span>}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={200} className="mt-10 flex justify-center">
          <a href="#exemple" className="group inline-flex items-center gap-2 text-[14px] font-medium text-ink-2 hover:text-ink">
            Voir une semaine type, étape par étape
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
