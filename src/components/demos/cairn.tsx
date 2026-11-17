"use client";

import { Check, Copy, KeyRound, Lock, ScanFace, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, type Step } from "./shell";

type NoteId = "charte" | "idees" | "vps";
const NOTE_ICONS: Record<NoteId, string> = { charte: "📄", idees: "💡", vps: "🔒" };
const SECRETS = ["k7#Rq9!vT2pL", "Plateau-B-2026", "m4X!z8Qe#rT1"];
const DONE = [true, false, false];

/** What the notes say, in each language. */
const T = {
  fr: {
    notes: { charte: "Charte de marque", idees: "Idées vidéo", vps: "Accès serveur" } as Record<NoteId, string>,
    todos: ["Logo validé", "Déclinaison vidéo", "Gabarits LinkedIn"],
    vault: ["VPS production · SSH", "Wi-Fi du studio", "Compte Instagram"],
    answer: "D'après tes notes, trois idées reviennent : les coulisses du tournage, une interview client et un tuto OBS de 60 secondes.",
    title: "Cairn · Notes",
    hint: "Coche une tâche, ouvre le coffre ou demande à l'IA",
    search: "Rechercher",
    searchLabel: "Rechercher une note",
    none: "Aucune note",
    tone: "Ton",
    toneText: "Direct, chaleureux, sans jargon. On tutoie. Une idée par phrase.",
    colours: "Couleurs",
    todo: "À faire",
    progress: (done: number, total: number) => `${done} sur ${total} terminées · modifié à l'instant`,
    vaultText: "Coffre chiffré. Seuls Antoine et Marc peuvent l'ouvrir.",
    copied: "Copié",
    copy: "Copier",
    unlock: "Ouvrir avec Face ID",
    encrypted: "Chiffré de bout en bout · AES-256",
    ideas: ["Coulisses du tournage, format vertical", "Interview client · 5 questions", "Tuto OBS en 60 secondes", "Coulisses du podcast, épisode 12"],
    ask: "Demander à l'IA : « Quelles idées reviennent le plus ? »",
    from: "Réponse tirée de 14 notes",
  },
  en: {
    notes: { charte: "Brand guidelines", idees: "Video ideas", vps: "Server access" } as Record<NoteId, string>,
    todos: ["Logo approved", "Video version", "LinkedIn templates"],
    vault: ["Production VPS · SSH", "Studio Wi-Fi", "Instagram account"],
    answer: "According to your notes, three ideas keep coming back: behind the scenes of the shoot, a client interview and a 60-second OBS tutorial.",
    title: "Cairn · Notes",
    hint: "Tick off a task, open the vault or ask the AI",
    search: "Search",
    searchLabel: "Search for a note",
    none: "No notes",
    tone: "Tone",
    toneText: "Direct, warm, no jargon. First names. One idea per sentence.",
    colours: "Colours",
    todo: "To do",
    progress: (done: number, total: number) => `${done} of ${total} done · edited just now`,
    vaultText: "Encrypted vault. Only Antoine and Marc can open it.",
    copied: "Copied",
    copy: "Copy",
    unlock: "Open with Face ID",
    encrypted: "End-to-end encrypted · AES-256",
    ideas: ["Behind the shoot, vertical format", "Client interview · 5 questions", "OBS tutorial in 60 seconds", "Behind the podcast, episode 12"],
    ask: "Ask the AI: “Which ideas come up most?”",
    from: "Answer drawn from 14 notes",
  },
  de: {
    notes: { charte: "Markenleitfaden", idees: "Videoideen", vps: "Serverzugang" } as Record<NoteId, string>,
    todos: ["Logo freigegeben", "Videoversion", "LinkedIn-Vorlagen"],
    vault: ["Produktions-VPS · SSH", "Studio-WLAN", "Instagram-Konto"],
    answer: "Laut deinen Notizen tauchen drei Ideen immer wieder auf: hinter den Kulissen des Drehs, ein Kundeninterview und ein OBS-Tutorial in 60 Sekunden.",
    title: "Cairn · Notizen",
    hint: "Hak eine Aufgabe ab, öffne den Tresor oder frag die KI",
    search: "Suchen",
    searchLabel: "Notiz suchen",
    none: "Keine Notizen",
    tone: "Tonalität",
    toneText: "Direkt, herzlich, ohne Fachjargon. Wir duzen. Eine Idee pro Satz.",
    colours: "Farben",
    todo: "Zu erledigen",
    progress: (done: number, total: number) => `${done} von ${total} erledigt · gerade bearbeitet`,
    vaultText: "Verschlüsselter Tresor. Nur Antoine und Marc können ihn öffnen.",
    copied: "Kopiert",
    copy: "Kopieren",
    unlock: "Mit Face ID öffnen",
    encrypted: "Ende-zu-Ende-verschlüsselt · AES-256",
    ideas: ["Hinter den Kulissen des Drehs, Hochformat", "Kundeninterview · 5 Fragen", "OBS-Tutorial in 60 Sekunden", "Hinter den Kulissen des Podcasts, Folge 12"],
    ask: "Frag die KI: «Welche Ideen kommen am häufigsten vor?»",
    from: "Antwort aus 14 Notizen",
  },
} satisfies Record<Locale, unknown>;

/** Cairn: notes to tick, a vault opened with Face ID, and an AI that answers from the notes. */
export function CairnDemo({ color, locale = "fr" }: { color: string; locale?: Locale }) {
  const tx = T[locale];
  const ANSWER = tx.answer;
  const NOTES = (Object.keys(NOTE_ICONS) as NoteId[]).map((id) => ({ id, label: tx.notes[id], icon: NOTE_ICONS[id] }));
  const TODOS = tx.todos.map((t, i) => ({ t, done: DONE[i] }));
  const VAULT = tx.vault.map((name, i) => ({ name, secret: SECRETS[i] }));
  const [note, setNote] = useState<NoteId>("charte");
  const [todos, setTodos] = useState(TODOS);
  const [vault, setVault] = useState<"locked" | "scan" | "open">("locked");
  const [copied, setCopied] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState(false);
  const [answer, setAnswer] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  // The AI writes its answer word by word.
  useEffect(() => {
    if (!asked) return;
    const words = ANSWER.split(" ");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setAnswer(words.slice(0, i).join(" "));
      if (i >= words.length) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [asked, ANSWER]);

  const unlock = () => {
    if (vault !== "locked") return;
    setVault("scan");
    later(() => setVault("open"), 1100);
  };
  const copy = (i = 0) => {
    setCopied(i);
    later(() => setCopied(null), 1600);
  };
  const toggle = (i: number) => setTodos((ts) => ts.map((t, n) => (n === i ? { ...t, done: !t.done } : t)));
  const reset = () => {
    timers.current.forEach(clearTimeout);
    setNote("charte");
    setTodos(TODOS);
    setVault("locked");
    setCopied(null);
    setQuery("");
    setAsked(false);
    setAnswer("");
  };

  const script = (): Step[] => [
    { at: "todo-1", do: () => toggle(1), wait: 900 },
    { at: "note-vps", do: () => setNote("vps"), wait: 700 },
    { at: "unlock", do: () => { setVault("scan"); later(() => setVault("open"), 1100); }, wait: 1700 },
    { at: "copy", do: () => copy(0), wait: 1200 },
    { at: "note-idees", do: () => setNote("idees"), wait: 700 },
    { at: "ask", do: () => setAsked(true), wait: 2600 },
  ];

  const shown = NOTES.filter((n) => n.label.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <DemoShell title={tx.title} color={color} locale={locale} hint={tx.hint} script={script} reset={reset}>
      <div className="flex h-full">
        <aside className="hidden w-[170px] shrink-0 flex-col gap-1 border-r border-[color:var(--edge-07)] p-3 sm:flex">
          <label className="mb-2 flex items-center gap-1.5 rounded-md border border-[color:var(--edge-10)] px-2 py-1 text-ink-3 focus-within:border-[color:var(--edge-14)]">
            <Search className="size-3 shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tx.search} aria-label={tx.searchLabel} className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3" />
          </label>
          {shown.map((n) => (
            <button
              key={n.id}
              type="button"
              data-demo={`note-${n.id}`}
              onClick={() => setNote(n.id)}
              className={cn("rounded-md px-2 py-1 text-left transition-colors", n.id === note ? "text-ink" : "text-ink-3 hover:bg-[var(--glass-05)] hover:text-ink-2")}
              style={n.id === note ? { background: soft(color, 22) } : undefined}
            >
              {n.icon} {n.label}
            </button>
          ))}
          {!shown.length && <p className="px-2 py-1 text-ink-3">{tx.none}</p>}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-1 overflow-x-auto border-b border-[color:var(--edge-07)] px-3 py-2 sm:hidden">
            {NOTES.map((n) => (
              <button key={n.id} type="button" onClick={() => setNote(n.id)} className={cn("shrink-0 rounded-full px-2.5 py-1", n.id === note ? "text-ink" : "text-ink-3")} style={n.id === note ? { background: soft(color, 22) } : undefined}>
                {n.icon} {n.label}
              </button>
            ))}
          </div>

          <div key={note} className="demo-pop min-h-0 flex-1 overflow-hidden p-5">
            {note === "charte" && (
              <>
                <p className="font-display text-[26px] leading-none">{tx.notes.charte}</p>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>{tx.tone}
                </p>
                <p className="mt-1 leading-relaxed text-ink-3">{tx.toneText}</p>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>{tx.colours}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {["#12805c", "#efede8", "#181715", color].map((c) => (
                    <span key={c} className="size-6 rounded-md ring-1 ring-wash/10" style={{ background: c }} />
                  ))}
                </div>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>{tx.todo}
                </p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {todos.map((t, i) => (
                    <li key={t.t}>
                      <button type="button" data-demo={`todo-${i}`} onClick={() => toggle(i)} className="flex items-center gap-2 text-left">
                        <span className="flex size-4 items-center justify-center rounded-[5px] border transition-colors" style={t.done ? { background: color, borderColor: color, color: onColor(color) } : { borderColor: "var(--edge-14)" }}>
                          {t.done && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        <span className={cn("transition-colors", t.done ? "text-ink-3 line-through" : "text-ink-2")}>{t.t}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[10.5px] text-ink-3">
                  {tx.progress(todos.filter((t) => t.done).length, todos.length)}
                </p>
              </>
            )}

            {note === "vps" && (
              <>
                <p className="font-display text-[26px] leading-none">{tx.notes.vps}</p>
                <p className="mt-2 text-ink-3">{tx.vaultText}</p>
                <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: soft(color, 40), background: soft(color, 9) }}>
                  <ul className="flex flex-col gap-2">
                    {VAULT.map((v, i) => (
                      <li key={v.name} className="flex items-center gap-3 rounded-xl bg-[var(--hub-pane)] p-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: soft(color, 22), color }}>
                          {vault === "open" ? <KeyRound className="size-3.5" /> : <Lock className="size-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{v.name}</span>
                          <span className={cn("block truncate font-mono text-[11.5px] transition-all", vault === "open" ? "text-ink-2" : "tracking-[0.25em] text-ink-3")}>{vault === "open" ? v.secret : "••••••••••••"}</span>
                        </span>
                        {vault === "open" && (
                          <button type="button" data-demo={i === 0 ? "copy" : undefined} onClick={() => copy(i)} className="demo-pop flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] hover:bg-[var(--glass-05)]">
                            {copied === i ? <Check className="size-3.5" style={{ color }} /> : <Copy className="size-3.5" />} <span className="max-sm:hidden">{copied === i ? tx.copied : tx.copy}</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {vault !== "open" && (
                    <button type="button" data-demo="unlock" onClick={unlock} className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-medium" style={{ background: color, color: onColor(color) }}>
                      <span className="relative flex size-4 items-center justify-center overflow-hidden">
                        <ScanFace className="size-4" />
                        {vault === "scan" && <span className="demo-scan absolute inset-x-0 h-px bg-current" />}
                      </span>
                      {vault === "scan" ? "Face ID…" : tx.unlock}
                    </button>
                  )}
                  <p className="mt-3 text-[10.5px] text-ink-3">{tx.encrypted}</p>
                </div>
              </>
            )}

            {note === "idees" && (
              <>
                <p className="font-display text-[26px] leading-none">{tx.notes.idees}</p>
                <ul className="mt-4 flex flex-col gap-1.5 text-ink-2">
                  {tx.ideas.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span style={{ color }}>–</span> {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl border border-[color:var(--edge-10)] bg-[var(--hub-pane)] p-3">
                  {!asked ? (
                    <button type="button" data-demo="ask" onClick={() => setAsked(true)} className="flex w-full items-center gap-2 text-left text-ink-3">
                      <Sparkles className="size-4" style={{ color }} /> {tx.ask}
                    </button>
                  ) : (
                    <div className="demo-pop">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
                        <Sparkles className="size-3.5" /> {tx.from}
                      </p>
                      <p className="mt-1.5 min-h-[3lh] leading-relaxed text-ink-2">
                        {answer}
                        {answer.length < ANSWER.length && <span className="caret ml-0.5 inline-block h-3 w-px translate-y-0.5" style={{ background: color }} />}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
