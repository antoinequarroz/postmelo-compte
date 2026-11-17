import { ProductIcon } from "@/components/product-icon";
import type { PublicProof } from "@/server/crm";
import { CountUp, Reveal } from "./reveal";

/**
 * Who uses the suite: figures, client logos and testimonials, all from the admin
 * (Preuves sociales). Each block shows only when it has something published, and the
 * whole section stays out of the page while there is nothing at all.
 */
export function Proof({ proof }: { proof: PublicProof }) {
  const { logos, testimonials } = proof;
  // One row: four figures at most, the first ones in the admin's order.
  const figures = proof.figures.slice(0, 4);
  if (!figures.length && !logos.length && !testimonials.length) return null;
  const [first, ...others] = testimonials;
  return (
    <section id="preuves" className="relative mx-auto max-w-[1160px] scroll-mt-20 px-4 py-28 sm:px-6">
      <Reveal className="text-center">
        <p className="text-[12.5px] font-medium uppercase tracking-[0.2em] text-accent">Ils l&apos;utilisent</p>
        <h2 className="mx-auto mt-4 max-w-[820px] font-display text-[clamp(40px,6vw,84px)] leading-[0.92]">
          Des équipes qui ont
          <br />
          <span className="italic text-ink-2">tout réuni.</span>
        </h2>
      </Reveal>

      {figures.length > 0 && (
        <Reveal delay={100} className="mt-16">
          <dl className={`grid overflow-hidden rounded-[28px] border border-line bg-[var(--glass-02)] ${COLS[figures.length]}`}>
            {figures.map((f) => (
              <div key={f.id} className="flex flex-col items-center justify-center gap-2 border-line px-6 py-10 text-center [&:not(:first-child)]:border-t sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-t-0">
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-[clamp(52px,6.4vw,88px)] leading-none tracking-[-0.02em]">
                  <Figure value={f.value} suffix={f.suffix} />
                </dd>
                <dd aria-hidden className="max-w-[220px] text-[14px] leading-snug text-ink-3">
                  {f.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      {logos.length > 0 && <Logos logos={logos} />}

      {testimonials.length > 0 && (
        <div className="mt-16 flex flex-col gap-5">
          <Reveal className="relative overflow-hidden rounded-[32px] border border-line bg-[var(--glass-02)] px-7 py-12 text-center sm:px-14 sm:py-16">
            <div aria-hidden className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
            <span aria-hidden className="relative block font-display text-[110px] leading-[0.5] text-accent/70">“</span>
            <blockquote className="relative mx-auto mt-6 max-w-[880px] font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] tracking-[-0.005em]">{first.quote}</blockquote>
            <Author t={first} className="relative mt-8 justify-center" />
          </Reveal>
          {others.length > 0 && (
            <ul className={`grid gap-5 ${others.length === 1 ? "" : others.length % 3 === 0 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
              {others.map((t, n) => (
                <Reveal as="li" key={t.id} delay={(n % 3) * 110} className="group flex flex-col rounded-[24px] border border-line bg-[var(--glass-025)] p-7 transition-colors duration-500 hover:border-accent/30 hover:bg-[var(--glass-04)]">
                  <blockquote className="font-display text-[22px] leading-[1.22]">
                    <span aria-hidden className="text-accent">“</span>
                    {t.quote}
                    <span aria-hidden className="text-accent">”</span>
                  </blockquote>
                  <Author t={t} className="mt-auto pt-7" />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

const COLS: Record<number, string> = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

/** "1200", "98", "4.9" count up; anything else ("24/7") is shown as typed. */
function Figure({ value, suffix }: { value: string; suffix: string }) {
  const n = value.replace(/['\s]/g, "");
  if (/^\d{1,7}$/.test(n)) return <CountUp to={Number(n)} suffix={suffix} />;
  return (
    <span className="tabular">
      {value}
      {suffix}
    </span>
  );
}

function Author({ t, className = "" }: { t: PublicProof["testimonials"][number]; className?: string }) {
  const sub = [t.role, t.company].filter(Boolean).join(" · ");
  return (
    <div className={`flex flex-wrap items-center gap-3 text-left ${className}`}>
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15px] font-medium text-accent">
        {t.author.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block text-[14.5px] font-medium text-ink">{t.author}</span>
        {sub && <span className="block text-[13px] text-ink-3">{sub}</span>}
      </span>
      {t.product && (
        <span className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-2">
          <ProductIcon id={t.product.id} color={t.product.color || undefined} size="sm" className="size-4" />
          {t.product.name}
        </span>
      )}
    </div>
  );
}

/** A quiet wall of logos, in the ink of the theme; their own colours come back on hover. A long list scrolls by. */
function Logos({ logos }: { logos: PublicProof["logos"] }) {
  const band = logos.length >= 6;
  const item = (l: PublicProof["logos"][number], hidden = false) => {
    const inner = l.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={l.image} alt={l.name} loading="lazy" className="proof-logo h-9 w-auto max-w-[150px] object-contain" />
    ) : (
      <span className="font-display text-[28px] leading-none text-ink-2 transition-colors duration-500 hover:text-ink">{l.name}</span>
    );
    return l.link ? (
      <a href={l.link} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className="flex items-center">
        {inner}
      </a>
    ) : (
      inner
    );
  };
  return (
    <Reveal delay={150} className="mt-14">
      <p className="text-center text-[12.5px] uppercase tracking-[0.16em] text-ink-3">Ils nous font confiance</p>
      {band ? (
        <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <ul className="marquee flex w-max items-center gap-16">
            {[...logos, ...logos].map((l, n) => (
              <li key={`${l.id}-${n}`} aria-hidden={n >= logos.length} className="flex h-12 items-center">
                {item(l, n >= logos.length)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {logos.map((l) => (
            <li key={l.id} className="flex h-12 items-center">
              {item(l)}
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}
