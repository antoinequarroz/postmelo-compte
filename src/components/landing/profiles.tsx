import { ArrowRight } from "lucide-react";
import { ProductIcon } from "@/components/product-icon";
import type { Locale } from "@/lib/i18n";
import { STATUS_LABEL } from "@/lib/site-text";
import { appColor, readable } from "./color";
import { Reveal } from "./reveal";

export type SuiteApp = { id: string; name: string; color: string; status: string };

/** The name of an app as the catalogue writes it. */
type Names = (id: string) => string;

type Profile = { title: string; problem: string; answer: (n: Names) => string; apps: string[] };

/**
 * Who the suite is for: the problem each one has, what the suite changes, and the apps they open.
 * The answer names its apps, so a profile is shown only when all of them are in the catalogue.
 */
const PROFILES: Record<Locale, Profile[]> = {
  fr: [
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
  ],
  en: [
    {
      title: "Agencies and creative studios",
      problem: "Client feedback lands on WhatsApp, briefs sleep in inboxes and logins linger in a spreadsheet.",
      answer: (n) => `Each client gets a channel in ${n("lamio")}, a brief and logins in ${n("cairn")}, tasks in ${n("tickup")}. Their posts are prepared and scheduled in ${n("metricove")}.`,
      apps: ["lamio", "cairn", "tickup", "metricove"],
    },
    {
      title: "Media, podcasts and video",
      problem: "One episode means a guest to book, a shoot to direct and ten clips to publish, each in a different tool.",
      answer: (n) => `The guest books a slot in ${n("alfred")}, ${n("nino")} directs the shoot, ${n("maya")} broadcasts it and ${n("metricove")} schedules the clips and Shorts on all your accounts.`,
      apps: ["alfred", "nino", "maya", "metricove"],
    },
    {
      title: "SMEs and small teams",
      problem: "Eight subscriptions, eight passwords, and nobody really knows who has access to what any more.",
      answer: () => "Messaging, notes, projects and a calendar, with one account per person. A newcomer is ready in three clicks.",
      apps: ["lamio", "cairn", "tickup", "alfred"],
    },
  ],
  de: [
    {
      title: "Agenturen und Kreativstudios",
      problem: "Kundenfeedback kommt über WhatsApp, Briefings schlummern in den Mails und Zugänge liegen in einer Tabelle herum.",
      answer: (n) => `Jeder Kunde hat seinen Kanal in ${n("lamio")}, sein Briefing und seine Zugänge in ${n("cairn")}, seine Aufgaben in ${n("tickup")}. Seine Posts werden in ${n("metricove")} vorbereitet und geplant.`,
      apps: ["lamio", "cairn", "tickup", "metricove"],
    },
    {
      title: "Medien, Podcasts und Video",
      problem: "Eine Folge heisst: einen Gast einplanen, einen Dreh umsetzen und zehn Ausschnitte veröffentlichen, jedes in einem anderen Tool.",
      answer: (n) => `Der Gast bucht seinen Termin in ${n("alfred")}, ${n("nino")} führt Regie beim Dreh, ${n("maya")} sendet ihn und ${n("metricove")} plant die Ausschnitte und Shorts auf all deinen Konten.`,
      apps: ["alfred", "nino", "maya", "metricove"],
    },
    {
      title: "KMU und kleine Teams",
      problem: "Acht Abos, acht Passwörter, und niemand weiss mehr so genau, wer worauf Zugriff hat.",
      answer: () => "Chat, Notizen, Projekte und Kalender, mit einem Konto pro Person. Neue Mitarbeitende sind in drei Klicks startklar.",
      apps: ["lamio", "cairn", "tickup", "alfred"],
    },
  ],
};

const T = {
  fr: { eyebrow: "À quoi ça sert", title: ["Pour les petites équipes", "qui font tout", "elles-mêmes."], intro: (suite: string) => `Parler, noter, organiser, recevoir, tourner, publier. ${suite} réunit les outils de ta semaine dans une seule suite, avec un seul compte. Voici à quoi elle sert, selon qui tu es.`, today: "Aujourd'hui", with: (suite: string) => `Avec ${suite}`, week: "Voir une semaine type, étape par étape" },
  en: { eyebrow: "What it's for", title: ["For small teams", "who do everything", "themselves."], intro: (suite: string) => `Talk, take notes, organise, host, film, publish. ${suite} brings the tools of your week together in a single suite, with a single account. Here is what it's for, depending on who you are.`, today: "Today", with: (suite: string) => `With ${suite}`, week: "See a typical week, step by step" },
  de: { eyebrow: "Wofür es ist", title: ["Für kleine Teams,", "die alles", "selbst machen."], intro: (suite: string) => `Reden, notieren, organisieren, empfangen, drehen, veröffentlichen. ${suite} vereint die Tools deiner Woche in einer Suite, mit einem Konto. So hilft sie dir, je nachdem, wer du bist.`, today: "Heute", with: (suite: string) => `Mit ${suite}`, week: "Eine typische Woche ansehen, Schritt für Schritt" },
};

/** "À quoi ça sert": three teams the suite is made for, each with the apps it uses. */
export function Profiles({ apps, suite, locale = "fr" }: { apps: SuiteApp[]; suite: string; locale?: Locale }) {
  const t = T[locale];
  const byId = new Map(apps.map((a) => [a.id, a]));
  const names: Names = (id) => byId.get(id)?.name ?? id;
  const profiles = PROFILES[locale].filter((p) => p.apps.every((id) => byId.has(id)));
  if (profiles.length === 0) return null;
  return (
    <section id="pour-qui" className="relative scroll-mt-20">
      <div className="mx-auto max-w-[1160px] px-4 pb-8 pt-20 sm:px-6 lg:pt-12">
        {/* On wide screens the intro sits beside the title, so the three teams show up on the second screen. */}
        <Reveal className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:gap-12">
          <div>
            <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.eyebrow}</p>
            <h2 className="mt-4 max-w-[1000px] font-display text-[clamp(42px,6.4vw,92px)] leading-[0.92] tracking-[-0.012em] lg:text-[clamp(64px,5.6vw,84px)]">
              {t.title[0]}
              <br />
              <span className="italic text-ink-2">
                {t.title[1]} <span className="whitespace-nowrap">{t.title[2]}</span>
              </span>
            </h2>
          </div>
          <p className="mt-7 max-w-[560px] text-[16.5px] leading-relaxed text-ink-2 lg:mt-0 lg:pb-1.5">
            {t.intro(suite)}
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

                <p className="relative mt-5 text-[11.5px] font-medium uppercase tracking-[0.14em] text-ink-3">{t.today}</p>
                <p className="relative mt-2 text-[15px] leading-relaxed text-ink-3">{p.problem}</p>

                <div aria-hidden className="relative my-6 h-px bg-line" />

                <p className="relative text-[11.5px] font-medium uppercase tracking-[0.14em] text-accent">{t.with(suite)}</p>
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
                      {a.status !== "disponible" && STATUS_LABEL[locale][a.status] && <span className="text-[11px] font-normal text-ink-3">{STATUS_LABEL[locale][a.status]}</span>}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={200} className="mt-10 flex justify-center">
          <a href="#exemple" className="group inline-flex items-center gap-2 text-[14px] font-medium text-ink-2 hover:text-ink">
            {t.week}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
