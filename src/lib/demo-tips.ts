import type { Locale } from "./i18n";

/** What to try in each demo, in a sentence, in each language. */
export const TRY: Record<Locale, Record<string, string>> = {
  fr: {
    lamio: "Écris dans #studio, réagis à un message, passe d'un canal à l'autre.",
    cairn: "Coche une tâche, ouvre le coffre avec Face ID, demande à l'IA ce que disent tes notes.",
    tickup: "Glisse une carte d'une colonne à l'autre, ou ajoute un ticket au sprint.",
    alfred: "Réserve un créneau sur la page publique et regarde-le arriver dans l'agenda.",
    metricove: "Fais rédiger un post par l'IA, choisis tes réseaux et programme-le.",
    nino: "Laisse la réalisation automatique suivre la voix, ou coupe toi-même sur une caméra.",
    maya: "Prépare une scène dans l'aperçu, puis envoie-la à l'antenne.",
  },
  en: {
    lamio: "Write in #studio, react to a message, switch from one channel to another.",
    cairn: "Tick off a task, open the vault with Face ID, ask the AI what your notes say.",
    tickup: "Drag a card from one column to another, or add a ticket to the sprint.",
    alfred: "Book a slot on the public page and watch it land in the calendar.",
    metricove: "Let the AI write a post, pick your networks and schedule it.",
    nino: "Let auto-directing follow the voice, or cut to a camera yourself.",
    maya: "Set up a scene in the preview, then send it to air.",
  },
  de: {
    lamio: "Schreib in #studio, reagiere auf eine Nachricht, wechsle zwischen den Kanälen.",
    cairn: "Hak eine Aufgabe ab, öffne den Tresor mit Face ID, frag die KI, was in deinen Notizen steht.",
    tickup: "Zieh eine Karte in eine andere Spalte oder füge dem Sprint ein Ticket hinzu.",
    alfred: "Buche einen Termin auf der öffentlichen Seite und sieh zu, wie er im Kalender landet.",
    metricove: "Lass die KI einen Post schreiben, wähl deine Netzwerke und plane ihn ein.",
    nino: "Lass die automatische Regie der Stimme folgen oder schneide selbst auf eine Kamera.",
    maya: "Bereite eine Szene in der Vorschau vor und schick sie dann auf Sendung.",
  },
};
