import { Plus } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/brand";
import type { SuiteApp } from "./profiles";
import { Reveal } from "./reveal";

/** What each app is for, in one word; an app not listed here gives its category from the catalogue. */
const USE: Record<string, string> = { lamio: "messagerie", cairn: "notes", tickup: "projets", alfred: "agenda", metricove: "réseaux sociaux", nino: "vidéo", maya: "vidéo" };

/** "a, b et c". */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`);

/** The questions asked before trying. Answers only say what the apps and this page already say. */
export function Faq({ apps, suite }: { apps: (SuiteApp & { category?: string })[]; suite: string }) {
  const has = new Set(apps.map((a) => a.id));
  const name = (id: string) => apps.find((a) => a.id === id)?.name ?? id;
  const devices = [
    has.has("lamio") && has.has("cairn") ? `${name("lamio")} et ${name("cairn")} ont leurs apps Mac et iPhone, ${name("cairn")} avec Face ID.` : null,
    has.has("alfred") ? `${name("alfred")} se synchronise avec ton calendrier iCloud dans les deux sens.` : null,
    has.has("nino") ? `${name("nino")} se pilote depuis le PC, l'iPad ou le Stream Deck.` : null,
    has.has("maya") ? `${name("maya")} arrive en app desktop pour Windows et macOS.` : null,
  ].filter(Boolean);
  // "Oui" only when an app with a Mac or iPhone app is there; the others are other devices.
  const apple = has.has("lamio") || has.has("cairn") || has.has("alfred");
  const uses = [...new Set(apps.map((a) => USE[a.id] ?? a.category?.toLowerCase()).filter((u): u is string => !!u))];

  const items = [
    {
      q: "C'est quoi, exactement ?",
      a: `Une suite d'applications pour travailler en équipe et créer du contenu${uses.length ? ` : ${list(uses)}` : ""}. Elles partagent un seul compte et le même design, et tu passes de l'une à l'autre sans te reconnecter.`,
    },
    {
      q: "Faut-il tout prendre ?",
      a: "Non. Tu choisis les applications qui te servent, et pour chaque personne de l'équipe, celles qu'elle peut ouvrir. Le compte reste le même si tu en ajoutes d'autres ensuite.",
    },
    {
      q: "C'est sécurisé ?",
      a: `La connexion passe par OpenID Connect, avec Face ID, les clés d'accès et la double authentification. Tu vois les appareils connectés et tu coupes un accès en un clic.${has.has("cairn") ? ` Tes mots de passe et tes clés SSH vont dans le coffre chiffré de ${name("cairn")}.` : ""}`,
    },
    {
      q: "Combien ça coûte ? Je peux essayer ?",
      a: "Ça dépend des applications et du nombre de personnes. Dis-le-nous dans le formulaire juste en dessous, on revient vers toi avec un accès d'essai.",
    },
    {
      q: "Ça marche sur Mac et iPhone ?",
      a: devices.length ? `${apple ? "Oui. " : ""}${devices.join(" ")}` : "Dis-nous sur quels appareils travaille ton équipe, on te dit ce qui est prêt.",
    },
  ];

  return (
    <section id="questions" className="relative scroll-mt-20">
      <div className="mx-auto grid max-w-[1160px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Questions</p>
          <h2 className="mt-4 font-display text-[clamp(40px,4.4vw,64px)] leading-[0.92]">
            Ce qu&apos;on nous
            <br />
            <span className="whitespace-nowrap italic text-ink-2">demande souvent.</span>
          </h2>
          <p className="mt-6 max-w-[360px] text-[15px] leading-relaxed text-ink-3">
            Une autre question sur {suite} ?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-ink underline-offset-4 hover:text-accent hover:underline">
              Écris-nous
            </a>
            , une vraie personne te répond.
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
