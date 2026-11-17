import { Plus } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/brand";
import type { Locale } from "@/lib/i18n";
import { listIn } from "@/lib/site-text";
import type { SuiteApp } from "./profiles";
import { Reveal } from "./reveal";

/** What each app is for, in one word; an app not listed here gives its category from the catalogue. */
const USE: Record<Locale, Record<string, string>> = {
  fr: { lamio: "messagerie", cairn: "notes", tickup: "projets", alfred: "agenda", metricove: "réseaux sociaux", nino: "vidéo", maya: "vidéo" },
  en: { lamio: "messaging", cairn: "notes", tickup: "projects", alfred: "calendar", metricove: "social media", nino: "video", maya: "video" },
  de: { lamio: "Chat", cairn: "Notizen", tickup: "Projekte", alfred: "Kalender", metricove: "Social Media", nino: "Video", maya: "Video" },
};

type N = (id: string) => string;

/** The texts of the section. Answers only say what the apps and this page already say. */
const T = {
  fr: {
    devices: {
      lamioCairn: (n: N) => `${n("lamio")} et ${n("cairn")} ont leurs apps Mac et iPhone, ${n("cairn")} avec Face ID.`,
      alfred: (n: N) => `${n("alfred")} se synchronise avec ton calendrier iCloud dans les deux sens.`,
      nino: (n: N) => `${n("nino")} se pilote depuis le PC, l'iPad ou le Stream Deck.`,
      maya: (n: N) => `${n("maya")} arrive en app desktop pour Windows et macOS.`,
      yes: "Oui. ",
      none: "Dis-nous sur quels appareils travaille ton équipe, on te dit ce qui est prêt.",
    },
    items: (uses: string, has: (id: string) => boolean, n: N) => [
      { q: "C'est quoi, exactement ?", a: `Une suite d'applications pour travailler en équipe et créer du contenu${uses ? ` : ${uses}` : ""}. Elles partagent un seul compte et le même design, et tu passes de l'une à l'autre sans te reconnecter.` },
      { q: "Faut-il tout prendre ?", a: "Non. Tu choisis les applications qui te servent, et pour chaque personne de l'équipe, celles qu'elle peut ouvrir. Le compte reste le même si tu en ajoutes d'autres ensuite." },
      { q: "C'est sécurisé ?", a: `La connexion passe par OpenID Connect, avec Face ID, les clés d'accès et la double authentification. Tu vois les appareils connectés et tu coupes un accès en un clic.${has("cairn") ? ` Tes mots de passe et tes clés SSH vont dans le coffre chiffré de ${n("cairn")}.` : ""}` },
      { q: "Combien ça coûte ? Je peux essayer ?", a: "Ça dépend des applications et du nombre de personnes. Dis-le-nous dans le formulaire juste en dessous, on revient vers toi avec un accès d'essai." },
    ],
    devicesQ: "Ça marche sur Mac et iPhone ?",
    eyebrow: "Questions",
    title: ["Ce qu'on nous", "demande souvent."],
    other: (suite: string) => `Une autre question sur ${suite} ? `,
    write: "Écris-nous",
    human: ", une vraie personne te répond.",
  },
  en: {
    devices: {
      lamioCairn: (n: N) => `${n("lamio")} and ${n("cairn")} have Mac and iPhone apps, ${n("cairn")} with Face ID.`,
      alfred: (n: N) => `${n("alfred")} syncs with your iCloud calendar both ways.`,
      nino: (n: N) => `${n("nino")} is controlled from a PC, an iPad or a Stream Deck.`,
      maya: (n: N) => `${n("maya")} is coming as a desktop app for Windows and macOS.`,
      yes: "Yes. ",
      none: "Tell us which devices your team works on, and we'll tell you what is ready.",
    },
    items: (uses: string, has: (id: string) => boolean, n: N) => [
      { q: "What is it, exactly?", a: `A suite of apps to work as a team and create content${uses ? `: ${uses}` : ""}. They share a single account and the same design, and you move from one to the next without signing in again.` },
      { q: "Do I have to take everything?", a: "No. You pick the apps you need and, for each person on the team, the ones they can open. The account stays the same if you add more later." },
      { q: "Is it secure?", a: `Sign-in goes through OpenID Connect, with Face ID, passkeys and two-factor authentication. You see the connected devices and can cut off access in one click.${has("cairn") ? ` Your passwords and SSH keys go into the encrypted vault of ${n("cairn")}.` : ""}` },
      { q: "How much does it cost? Can I try it?", a: "It depends on the apps and the number of people. Tell us in the form just below and we'll get back to you with a trial account." },
    ],
    devicesQ: "Does it work on Mac and iPhone?",
    eyebrow: "Questions",
    title: ["What people", "often ask us."],
    other: (suite: string) => `Another question about ${suite}? `,
    write: "Write to us",
    human: ", a real person will answer.",
  },
  de: {
    devices: {
      lamioCairn: (n: N) => `${n("lamio")} und ${n("cairn")} haben Apps für Mac und iPhone, ${n("cairn")} mit Face ID.`,
      alfred: (n: N) => `${n("alfred")} synchronisiert sich in beide Richtungen mit deinem iCloud-Kalender.`,
      nino: (n: N) => `${n("nino")} steuerst du vom PC, iPad oder Stream Deck aus.`,
      maya: (n: N) => `${n("maya")} kommt als Desktop-App für Windows und macOS.`,
      yes: "Ja. ",
      none: "Sag uns, auf welchen Geräten dein Team arbeitet, und wir sagen dir, was bereit ist.",
    },
    items: (uses: string, has: (id: string) => boolean, n: N) => [
      { q: "Was ist das genau?", a: `Eine Suite von Apps, um im Team zu arbeiten und Inhalte zu erstellen${uses ? `: ${uses}` : ""}. Sie teilen ein Konto und dasselbe Design, und du wechselst von einer zur anderen, ohne dich neu anzumelden.` },
      { q: "Muss ich alles nehmen?", a: "Nein. Du wählst die Apps, die du brauchst, und für jede Person im Team, welche sie öffnen darf. Das Konto bleibt dasselbe, wenn du später weitere hinzufügst." },
      { q: "Ist das sicher?", a: `Die Anmeldung läuft über OpenID Connect, mit Face ID, Passkeys und Zwei-Faktor-Authentifizierung. Du siehst die verbundenen Geräte und sperrst einen Zugang mit einem Klick.${has("cairn") ? ` Deine Passwörter und SSH-Schlüssel liegen im verschlüsselten Tresor von ${n("cairn")}.` : ""}` },
      { q: "Was kostet es? Kann ich es testen?", a: "Das hängt von den Apps und der Anzahl Personen ab. Sag es uns im Formular gleich darunter, wir melden uns mit einem Testzugang." },
    ],
    devicesQ: "Läuft es auf Mac und iPhone?",
    eyebrow: "Fragen",
    title: ["Was man uns", "oft fragt."],
    other: (suite: string) => `Eine andere Frage zu ${suite}? `,
    write: "Schreib uns",
    human: ", ein echter Mensch antwortet dir.",
  },
};

/** The questions asked before trying. */
export function Faq({ apps, suite, locale = "fr" }: { apps: (SuiteApp & { category?: string })[]; suite: string; locale?: Locale }) {
  const t = T[locale];
  const has = new Set(apps.map((a) => a.id));
  const name = (id: string) => apps.find((a) => a.id === id)?.name ?? id;
  const devices = [
    has.has("lamio") && has.has("cairn") ? t.devices.lamioCairn(name) : null,
    has.has("alfred") ? t.devices.alfred(name) : null,
    has.has("nino") ? t.devices.nino(name) : null,
    has.has("maya") ? t.devices.maya(name) : null,
  ].filter(Boolean);
  // "Oui" only when an app with a Mac or iPhone app is there; the others are other devices.
  const apple = has.has("lamio") || has.has("cairn") || has.has("alfred");
  const uses = [...new Set(apps.map((a) => USE[locale][a.id] ?? a.category?.toLowerCase()).filter((u): u is string => !!u))];

  const items = [
    ...t.items(listIn(uses, locale), (id) => has.has(id), name),
    { q: t.devicesQ, a: devices.length ? `${apple ? t.devices.yes : ""}${devices.join(" ")}` : t.devices.none },
  ];

  return (
    <section id="questions" className="relative scroll-mt-20">
      <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">{t.eyebrow}</p>
          <h2 className="mt-4 font-display text-[clamp(40px,4.4vw,64px)] leading-[0.92]">
            {t.title[0]}
            <br />
            <span className="whitespace-nowrap italic text-ink-2">{t.title[1]}</span>
          </h2>
          <p className="mt-6 max-w-[360px] text-[15px] leading-relaxed text-ink-3">
            {t.other(suite)}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline-offset-4 hover:text-accent hover:underline">
              {t.write}
            </a>
            {t.human}
          </p>
        </Reveal>
        <Reveal delay={120} className="flex flex-col gap-3">
          {items.map(({ q, a }, n) => (
            <details key={q} name="faq" open={n === 0} className="faq group rounded-[22px] border border-line bg-[var(--glass-025)] transition-colors duration-500 open:border-line-strong open:bg-[var(--glass-04)] hover:border-line-strong">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 text-[17px] font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex-1">{q}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--glass-05)] text-ink-2 transition-[transform,background-color,color] duration-500 group-open:rotate-45 group-open:bg-accent group-open:text-accent-ink" style={{ transitionTimingFunction: "var(--ease-out)" }}>
                  <Plus className="size-4" strokeWidth={2.2} />
                </span>
              </summary>
              <div>
                <p className="max-w-[620px] px-6 pb-6 text-[15px] leading-relaxed text-ink-2">{a}</p>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
