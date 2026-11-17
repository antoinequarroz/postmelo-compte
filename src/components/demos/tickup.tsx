"use client";

import { Check, Plus } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, typing, type Step } from "./shell";

type Col = "todo" | "doing" | "done";
type Card = { id: string; title: string; col: Col; tag: string };
const COL_IDS: Col[] = ["todo", "doing", "done"];
const NEXT: Record<Col, Col> = { todo: "doing", doing: "done", done: "todo" };
const PROGRESS: Record<Col, number> = { todo: 0, doing: 55, done: 100 };
const SPOTS: { id: string; col: Col }[] = [
  { id: "STU-14", col: "todo" },
  { id: "STU-15", col: "todo" },
  { id: "STU-16", col: "todo" },
  { id: "STU-12", col: "doing" },
  { id: "STU-13", col: "doing" },
  { id: "STU-9", col: "done" },
  { id: "STU-8", col: "done" },
];
const deck = (list: [string, string][]): Card[] => SPOTS.map((c, i) => ({ ...c, title: list[i][0], tag: list[i][1] }));

/** What the board says, in each language. */
const T = {
  fr: {
    cols: { todo: "À faire", doing: "En cours", done: "Terminé" } as Record<Col, string>,
    start: deck([["Brief vidéo client", "Vidéo"], ["Sous-titres épisode 12", "Podcast"], ["Miniatures YouTube", "Social"], ["Montage épisode 12", "Podcast"], ["Visuels LinkedIn", "Social"], ["Générique podcast", "Podcast"], ["Charte graphique", "Design"]]),
    fresh: "Nouveau",
    teaser: "Teaser épisode 13",
    hint: "Glisse une carte, ou touche-la pour l'avancer",
    done: (n: number, total: number) => `${n}/${total} terminés`,
    ticketTitle: "Titre du ticket",
    advance: (title: string, col: string) => `${title}, ${col}. Avancer`,
    ticket: "Ticket",
  },
  en: {
    cols: { todo: "To do", doing: "In progress", done: "Done" } as Record<Col, string>,
    start: deck([["Client video brief", "Video"], ["Episode 12 subtitles", "Podcast"], ["YouTube thumbnails", "Social"], ["Episode 12 edit", "Podcast"], ["LinkedIn visuals", "Social"], ["Podcast intro", "Podcast"], ["Brand guidelines", "Design"]]),
    fresh: "New",
    teaser: "Episode 13 teaser",
    hint: "Drag a card, or tap it to move it forward",
    done: (n: number, total: number) => `${n}/${total} done`,
    ticketTitle: "Ticket title",
    advance: (title: string, col: string) => `${title}, ${col}. Move forward`,
    ticket: "Ticket",
  },
  de: {
    cols: { todo: "Zu erledigen", doing: "In Arbeit", done: "Erledigt" } as Record<Col, string>,
    start: deck([["Kunden-Video-Briefing", "Video"], ["Untertitel Folge 12", "Podcast"], ["YouTube-Thumbnails", "Social"], ["Schnitt Folge 12", "Podcast"], ["LinkedIn-Visuals", "Social"], ["Podcast-Intro", "Podcast"], ["Corporate Design", "Design"]]),
    fresh: "Neu",
    teaser: "Teaser Folge 13",
    hint: "Zieh eine Karte oder tippe darauf, um sie weiterzuschieben",
    done: (n: number, total: number) => `${n}/${total} erledigt`,
    ticketTitle: "Ticket-Titel",
    advance: (title: string, col: string) => `${title}, ${col}. Weiterschieben`,
    ticket: "Ticket",
  },
} satisfies Record<Locale, unknown>;

/** TickUp: a kanban where cards really move. Drag them, or tap one to send it to the next column. */
export function TickUpDemo({ color, locale = "fr" }: { color: string; locale?: Locale }) {
  const t = T[locale];
  const START = t.start;
  const COLS = COL_IDS.map((id) => ({ id, name: t.cols[id] }));
  const [cards, setCards] = useState(START);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [burst, setBurst] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; over: Col | null } | null>(null);
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const count = useRef(17);

  // Cards glide to their new place (FLIP), whoever moved them.
  useLayoutEffect(() => {
    nodes.current.forEach((el, id) => {
      const before = rects.current.get(id);
      const after = el.getBoundingClientRect();
      if (before && !drag && (before.left !== after.left || before.top !== after.top)) {
        el.animate([{ transform: `translate(${before.left - after.left}px, ${before.top - after.top}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      }
      rects.current.set(id, after);
    });
  });

  const move = (id: string, col: Col) => {
    setCards((cs) => {
      const card = cs.find((c) => c.id === id);
      if (!card || card.col === col) return cs;
      return [...cs.filter((c) => c.id !== id), { ...card, col }];
    });
    if (col === "done") {
      setBurst(id);
      setTimeout(() => setBurst((b) => (b === id ? null : b)), 800);
    }
  };
  const addCard = (title: string) => {
    const text = title.trim();
    if (text) setCards((cs) => [{ id: `STU-${count.current++}`, title: text, col: "todo", tag: t.fresh }, ...cs]);
    setDraft("");
    setAdding(false);
  };

  const board = useRef<HTMLDivElement>(null);
  // The column under the pointer, from the columns' boxes (the dragged card itself covers the point).
  const colAt = (x: number, y: number) => {
    const cols = board.current?.querySelectorAll<HTMLElement>("[data-col]") ?? [];
    for (const el of cols) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top - 20 && y <= r.bottom + 20) return el.dataset.col as Col;
    }
    return undefined;
  };

  const onDown = (e: React.PointerEvent, id: string) => {
    press.current = { id, x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < 6) return;
    p.moved = true;
    setDrag({ id: p.id, dx, dy, over: colAt(e.clientX, e.clientY) ?? null });
  };
  const onUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (!p.moved) {
      const card = cards.find((c) => c.id === p.id);
      if (card) move(card.id, NEXT[card.col]);
      return;
    }
    const col = colAt(e.clientX, e.clientY);
    // The dragged card starts its glide from where it was dropped.
    const el = nodes.current.get(p.id);
    if (el) rects.current.set(p.id, el.getBoundingClientRect());
    setDrag(null);
    if (col) move(p.id, col);
  };

  const reset = () => {
    setCards(START);
    setAdding(false);
    setDraft("");
    setDrag(null);
    count.current = 17;
  };
  const script = (): Step[] => [
    { at: "card-STU-14", do: () => move("STU-14", "doing"), wait: 1100 },
    { at: "card-STU-12", do: () => move("STU-12", "done"), wait: 1300 },
    { at: "add", do: () => setAdding(true), wait: 300 },
    ...typing(t.teaser, setDraft, 45),
    { do: () => addCard(t.teaser), wait: 1200 },
    { at: "card-STU-13", do: () => move("STU-13", "done"), wait: 1500 },
  ];

  const done = cards.filter((c) => c.col === "done").length;
  const c = color;
  return (
    <DemoShell title="TickUp · Studio · Sprint 4" color={c} locale={locale} hint={t.hint} script={script} reset={reset}>
      <div className="flex h-full flex-col p-3 sm:p-4">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[13px] font-semibold">Sprint 4</p>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash/10">
            <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${(done / cards.length) * 100}%`, background: c, transitionTimingFunction: "var(--ease-out)" }} />
          </span>
          <span className="tabular text-[11px] text-ink-3">
            {t.done(done, cards.length)}
          </span>
        </div>
        <div ref={board} className="grid min-h-0 flex-1 grid-cols-3 gap-2">
          {COLS.map((col) => {
            const list = cards.filter((x) => x.col === col.id);
            return (
              <div key={col.id} data-col={col.id} className={cn("flex min-h-0 flex-col gap-2 rounded-xl p-1.5 transition-colors sm:p-2", drag?.over === col.id ? "" : "bg-wash/[0.03]")} style={drag?.over === col.id ? { background: soft(c, 12), outline: `1px dashed ${soft(c, 60)}` } : undefined}>
                <p className="flex items-center gap-1.5 px-1 text-[10.5px] font-medium text-ink-2">
                  <span className="size-2 rounded-full border border-ink-3" style={col.id === "done" ? { background: c, borderColor: c } : col.id === "doing" ? { borderColor: c } : undefined} /> {col.name}
                  <span className="tabular ml-auto text-ink-3">{list.length}</span>
                </p>
                {col.id === "todo" && adding && (
                  <form
                    className="demo-pop"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addCard(draft);
                    }}
                  >
                    <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => !draft && setAdding(false)} placeholder={t.ticketTitle} aria-label={t.ticketTitle} maxLength={40} className="w-full rounded-lg border bg-raised px-2.5 py-2 text-[11.5px] outline-none" style={{ borderColor: soft(c, 60) }} />
                  </form>
                )}
                <div className={cn("flex min-h-0 flex-col gap-2", drag ? "overflow-visible" : "overflow-hidden")}>
                  {list.map((x) => {
                    const dragging = drag?.id === x.id;
                    return (
                      <div
                        key={x.id}
                        ref={(el) => {
                          if (el) nodes.current.set(x.id, el);
                          else nodes.current.delete(x.id);
                        }}
                        data-demo={`card-${x.id}`}
                        role="button"
                        tabIndex={0}
                        aria-label={t.advance(x.title, col.name)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), move(x.id, NEXT[x.col]))}
                        onPointerDown={(e) => onDown(e, x.id)}
                        onPointerMove={onMove}
                        onPointerUp={onUp}
                        onPointerCancel={() => ((press.current = null), setDrag(null))}
                        className={cn("relative cursor-grab touch-pan-y select-none rounded-lg border border-[color:var(--edge-10)] bg-raised p-2 sm:p-2.5", dragging && "z-20 cursor-grabbing shadow-2xl")}
                        style={dragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(2.5deg)` } : undefined}
                      >
                        {burst === x.id && <span aria-hidden className="demo-burst absolute inset-0 rounded-lg" style={{ boxShadow: `0 0 0 2px ${c}` }} />}
                        <p className="flex items-center gap-1 text-[9.5px] text-ink-3">
                          {x.id}
                          <span className="ml-auto max-sm:hidden">{x.tag}</span>
                        </p>
                        <p className={cn("mt-0.5 font-medium leading-snug max-sm:text-[11px]", x.col === "done" && "text-ink-2")}>{x.title}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="h-1 flex-1 rounded-full bg-wash/10">
                            <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${PROGRESS[x.col]}%`, background: c }} />
                          </span>
                          {x.col === "done" && (
                            <span className="flex size-3.5 items-center justify-center rounded-full" style={{ background: c, color: onColor(c) }}>
                              <Check className="size-2.5" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {col.id === "todo" && !adding && (
                  <button type="button" data-demo="add" onClick={() => setAdding(true)} className="flex items-center gap-1 rounded-md px-1 py-0.5 text-left text-[10.5px] text-ink-3 hover:text-ink">
                    <Plus className="size-3" /> {t.ticket}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DemoShell>
  );
}
