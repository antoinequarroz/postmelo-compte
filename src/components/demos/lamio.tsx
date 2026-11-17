"use client";

import { FileText, Hash, SendHorizontal, SmilePlus } from "lucide-react";
import { useRef, useState } from "react";
import { soft } from "@/components/landing/mocks";
import { cn } from "@/lib/utils";
import { DemoShell, onColor, typing, type Step } from "./shell";

type Msg = { id: number; who: string; hue: number; text: string; time: string; likes: number; mine?: boolean };
type Channel = "studio" | "general" | "design";

const PEOPLE = { Léa: 200, Marc: 30, Julie: 300, Toi: 150 } as const;
const m = (id: number, who: keyof typeof PEOPLE, text: string, time: string, likes = 0): Msg => ({ id, who, hue: PEOPLE[who], text, time, likes });

const START: Record<Channel, Msg[]> = {
  studio: [m(1, "Léa", "On tourne l'épisode 12 demain à 9 h, plateau B.", "13:58"), m(2, "Marc", "Les micros sont chargés, j'amène le Stream Deck.", "14:01", 2)],
  general: [m(11, "Julie", "Bienvenue à Sam dans l'équipe 👋", "09:12", 6), m(12, "Marc", "Le café de la salle 2 refonctionne ☕", "10:40", 3)],
  design: [m(21, "Julie", "Nouvelles miniatures pour l'épisode 12", "11:05"), m(22, "Léa", "J'adore la deuxième, on part là-dessus ?", "11:20", 1), m(23, "Julie", "Oui, je l'exporte en 1080 × 1920 pour les Shorts.", "11:22")],
};
const ABOUT: Record<Channel, string> = {
  studio: "Tournages, montage et diffusion du studio. 9 membres.",
  general: "Les annonces de toute l'équipe. 14 membres.",
  design: "Visuels, miniatures et charte. 5 membres.",
};
const REPLIES = ["Bien reçu 👍", "Parfait, merci !", "Je m'en occupe.", "Top, on en parle au point de 14 h."];

const clock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Lamio: a real little chat. Write and send, react to a message, switch channels. */
export function LamioDemo({ color }: { color: string }) {
  const [channel, setChannel] = useState<Channel>("studio");
  const [msgs, setMsgs] = useState(START);
  const [draft, setDraft] = useState("");
  const [typingWho, setTypingWho] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<Channel>>(new Set(["studio"]));
  const next = useRef(100);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const add = (ch: Channel, msg: Omit<Msg, "id" | "hue" | "time" | "likes"> & { who: keyof typeof PEOPLE }) =>
    setMsgs((all) => ({ ...all, [ch]: [...all[ch], { ...msg, id: next.current++, hue: PEOPLE[msg.who], time: clock(), likes: 0 }] }));
  const like = (id: number) => setMsgs((all) => ({ ...all, [channel]: all[channel].map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)) }));
  const open = (ch: Channel) => {
    setChannel(ch);
    setSeen((s) => new Set(s).add(ch));
  };

  const send = (text = draft) => {
    const t = text.trim();
    if (!t) return;
    const ch = channel;
    add(ch, { who: "Toi", text: t, mine: true });
    setDraft("");
    // Someone answers, as in a living team.
    const who = (["Léa", "Marc", "Julie"] as const)[Math.floor(Math.random() * 3)];
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTypingWho(who);
      timer.current = setTimeout(() => {
        setTypingWho(null);
        add(ch, { who, text: REPLIES[Math.floor(Math.random() * REPLIES.length)] });
      }, 1300);
    }, 500);
  };

  const reset = () => {
    clearTimeout(timer.current);
    setChannel("studio");
    setMsgs(START);
    setDraft("");
    setTypingWho(null);
    setSeen(new Set(["studio"]));
  };

  const script = (): Step[] => [
    { do: () => setTypingWho("Julie"), wait: 1300 },
    { do: () => { setTypingWho(null); add("studio", { who: "Julie", text: "Le montage de l'épisode 11 est en ligne 🎙️" }); }, wait: 900 },
    { at: "like-2", do: () => setMsgs((all) => ({ ...all, studio: all.studio.map((x) => (x.id === 2 ? { ...x, likes: x.likes + 1 } : x)) })), wait: 500 },
    { at: "composer", wait: 200 },
    ...typing("Top, je le programme sur Metricove pour jeudi.", setDraft),
    { at: "send", do: () => { setMsgs((all) => ({ ...all, studio: [...all.studio, { id: next.current++, who: "Toi", hue: PEOPLE.Toi, text: "Top, je le programme sur Metricove pour jeudi.", time: clock(), likes: 0, mine: true }] })); setDraft(""); }, wait: 700 },
    { do: () => setTypingWho("Léa"), wait: 1300 },
    { do: () => { setTypingWho(null); add("studio", { who: "Léa", text: "Parfait 🙌 je préviens l'invitée." }); }, wait: 1400 },
    { at: "ch-design", do: () => { setChannel("design"); setSeen((s) => new Set(s).add("design")); }, wait: 2200 },
    { at: "ch-studio", do: () => setChannel("studio"), wait: 1000 },
  ];

  const list = msgs[channel];
  return (
    <DemoShell title={`Lamio · #${channel}`} color={color} hint="Écris un message et appuie sur Entrée" script={script} reset={reset} onTakeOver={() => setTypingWho(null)}>
      <div className="flex h-full">
        <aside className="hidden w-[150px] shrink-0 flex-col gap-1 border-r border-[color:var(--edge-07)] p-3 sm:flex">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-3">Canaux</p>
          {(["general", "studio", "design"] as Channel[]).map((c) => (
            <button
              key={c}
              type="button"
              data-demo={`ch-${c}`}
              onClick={() => open(c)}
              className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors", c === channel ? "text-ink" : "text-ink-3 hover:bg-[var(--glass-05)] hover:text-ink-2")}
              style={c === channel ? { background: soft(color, 22) } : undefined}
            >
              <Hash className="size-3" /> {c}
              {!seen.has(c) && c !== "general" && (
                <span className="ml-auto rounded-full px-1.5 text-[9.5px] font-semibold " style={{ background: color, color: onColor(color) }}>
                  {START[c].length}
                </span>
              )}
            </button>
          ))}
          <p className="mb-1 mt-3 text-[10px] uppercase tracking-wider text-ink-3">En ligne</p>
          {["Léa", "Marc", "Julie"].map((n) => (
            <span key={n} className="flex items-center gap-1.5 px-2 py-1 text-ink-3">
              <span className="size-1.5 rounded-full bg-[#28c840]" /> {n}
            </span>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Channels as tabs on phones */}
          <div className="flex gap-1 border-b border-[color:var(--edge-07)] px-3 py-2 sm:hidden">
            {(["general", "studio", "design"] as Channel[]).map((c) => (
              <button key={c} type="button" onClick={() => open(c)} className={cn("flex items-center gap-1 rounded-full px-2.5 py-1", c === channel ? "text-ink" : "text-ink-3")} style={c === channel ? { background: soft(color, 22) } : undefined}>
                <Hash className="size-3" /> {c}
              </button>
            ))}
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden px-4 pb-2 pt-4">
            {/* The channel's head, at the top of the window when it is tall enough. */}
            <div className="mb-auto max-sm:hidden">
              <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                <Hash className="size-4" style={{ color }} /> {channel}
              </p>
              <p className="mt-1 text-ink-3">{ABOUT[channel]}</p>
              {channel === "studio" && (
                <div className="mt-3 flex max-w-[360px] items-center gap-2.5 rounded-xl border p-2.5" style={{ borderColor: soft(color, 30), background: soft(color, 8) }}>
                  <FileText className="size-4 shrink-0" style={{ color }} />
                  <span className="min-w-0">
                    <span className="block font-medium">Planning des tournages · novembre</span>
                    <span className="block text-[10.5px] text-ink-3">Épinglé par Léa · mis à jour ce matin</span>
                  </span>
                </div>
              )}
            </div>
            {list.slice(-6).map((x) => (
              <div key={x.id} className="demo-pop group flex gap-2.5">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold"
                  style={{ background: `oklch(0.62 0.13 ${x.hue} / 0.25)`, color: `light-dark(oklch(0.45 0.13 ${x.hue}), oklch(0.8 0.12 ${x.hue}))` }}
                >
                  {x.who === "Toi" ? "A" : x.who[0]}
                </span>
                <div className="relative min-w-0 flex-1">
                  <button
                    type="button"
                    data-demo={`like-${x.id}`}
                    onClick={() => like(x.id)}
                    title="Réagir"
                    className="absolute right-0 top-0 flex size-6 items-center justify-center rounded-full text-ink-3 opacity-0 transition-opacity hover:bg-[var(--glass-05)] hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <SmilePlus className="size-3.5" />
                    <span className="sr-only">Réagir avec 👍</span>
                  </button>
                  <p className="text-[11px] font-semibold">
                    {x.who === "Toi" ? "Toi" : x.who} <span className="font-normal text-ink-3">{x.time}</span>
                  </p>
                  <p className="break-words text-ink-2">{x.text}</p>
                  {x.likes > 0 && (
                    <button type="button" onClick={() => like(x.id)} className="demo-pop mt-1 flex items-center gap-1 rounded-full border px-1.5 py-px text-[10.5px]" style={{ borderColor: soft(color, 40), background: soft(color, 12) }}>
                      👍 <span className="tabular">{x.likes}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className={cn("flex h-4 items-center gap-2 text-[11px] text-ink-3 transition-opacity", typingWho ? "opacity-100" : "opacity-0")}>
              <span className="typing flex gap-0.5">
                <span className="size-1.5 rounded-full bg-ink-3" />
                <span className="size-1.5 rounded-full bg-ink-3" />
                <span className="size-1.5 rounded-full bg-ink-3" />
              </span>
              {typingWho} écrit…
            </div>
          </div>
          <form
            className="m-3 mt-1 flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[color:var(--edge-10)] bg-[var(--hub-pane)] pl-3 pr-1.5 focus-within:border-[color:var(--edge-14)]"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              data-demo="composer"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Écrire dans #${channel}`}
              aria-label="Message"
              maxLength={160}
              className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-3"
            />
            <button type="submit" data-demo="send" title="Envoyer" className="press flex size-7 items-center justify-center rounded-lg transition-opacity disabled:opacity-40" style={{ background: color, color: onColor(color) }} disabled={!draft.trim()}>
              <SendHorizontal className="size-3.5" />
              <span className="sr-only">Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </DemoShell>
  );
}
