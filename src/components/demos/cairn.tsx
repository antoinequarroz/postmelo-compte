"use client";

import { Check, Copy, KeyRound, Lock, ScanFace, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, type Step } from "./shell";

type NoteId = "charte" | "idees" | "vps";
const NOTES: { id: NoteId; label: string; icon: string }[] = [
  { id: "charte", label: "Charte de marque", icon: "📄" },
  { id: "idees", label: "Idées vidéo", icon: "💡" },
  { id: "vps", label: "Accès serveur", icon: "🔒" },
];
const TODOS = [
  { t: "Logo validé", done: true },
  { t: "Déclinaison vidéo", done: false },
  { t: "Gabarits LinkedIn", done: false },
];
const VAULT = [
  { name: "VPS production · SSH", secret: "k7#Rq9!vT2pL" },
  { name: "Wi-Fi du studio", secret: "Plateau-B-2026" },
  { name: "Compte Instagram", secret: "m4X!z8Qe#rT1" },
];
const ANSWER = "D'après tes notes, trois idées reviennent : les coulisses du tournage, une interview client et un tuto OBS de 60 secondes.";

/** Cairn: notes to tick, a vault opened with Face ID, and an AI that answers from the notes. */
export function CairnDemo({ color }: { color: string }) {
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
  }, [asked]);

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
    <DemoShell title="Cairn · Notes" color={color} hint="Coche une tâche, ouvre le coffre ou demande à l'IA" script={script} reset={reset}>
      <div className="flex h-full">
        <aside className="hidden w-[170px] shrink-0 flex-col gap-1 border-r border-[color:var(--edge-07)] p-3 sm:flex">
          <label className="mb-2 flex items-center gap-1.5 rounded-md border border-[color:var(--edge-10)] px-2 py-1 text-ink-3 focus-within:border-[color:var(--edge-14)]">
            <Search className="size-3 shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher" aria-label="Rechercher une note" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3" />
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
          {!shown.length && <p className="px-2 py-1 text-ink-3">Aucune note</p>}
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
                <p className="font-display text-[26px] leading-none">Charte de marque</p>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>Ton
                </p>
                <p className="mt-1 leading-relaxed text-ink-3">Direct, chaleureux, sans jargon. On tutoie. Une idée par phrase.</p>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>Couleurs
                </p>
                <div className="mt-2 flex gap-1.5">
                  {["#12805c", "#efede8", "#181715", color].map((c) => (
                    <span key={c} className="size-6 rounded-md ring-1 ring-wash/10" style={{ background: c }} />
                  ))}
                </div>
                <p className="mt-4 text-ink-2">
                  <span style={{ color }}>## </span>À faire
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
                  {todos.filter((t) => t.done).length} sur {todos.length} terminées · modifié à l&apos;instant
                </p>
              </>
            )}

            {note === "vps" && (
              <>
                <p className="font-display text-[26px] leading-none">Accès serveur</p>
                <p className="mt-2 text-ink-3">Coffre chiffré. Seuls Antoine et Marc peuvent l&apos;ouvrir.</p>
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
                            {copied === i ? <Check className="size-3.5" style={{ color }} /> : <Copy className="size-3.5" />} <span className="max-sm:hidden">{copied === i ? "Copié" : "Copier"}</span>
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
                      {vault === "scan" ? "Face ID…" : "Ouvrir avec Face ID"}
                    </button>
                  )}
                  <p className="mt-3 text-[10.5px] text-ink-3">Chiffré de bout en bout · AES-256</p>
                </div>
              </>
            )}

            {note === "idees" && (
              <>
                <p className="font-display text-[26px] leading-none">Idées vidéo</p>
                <ul className="mt-4 flex flex-col gap-1.5 text-ink-2">
                  {["Coulisses du tournage, format vertical", "Interview client · 5 questions", "Tuto OBS en 60 secondes", "Coulisses du podcast, épisode 12"].map((t) => (
                    <li key={t} className="flex gap-2">
                      <span style={{ color }}>–</span> {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 rounded-2xl border border-[color:var(--edge-10)] bg-[var(--hub-pane)] p-3">
                  {!asked ? (
                    <button type="button" data-demo="ask" onClick={() => setAsked(true)} className="flex w-full items-center gap-2 text-left text-ink-3">
                      <Sparkles className="size-4" style={{ color }} /> Demander à l&apos;IA : « Quelles idées reviennent le plus ? »
                    </button>
                  ) : (
                    <div className="demo-pop">
                      <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
                        <Sparkles className="size-3.5" /> Réponse tirée de 14 notes
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
