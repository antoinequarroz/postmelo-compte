import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Same fonts as postmelo.ch: Geist for the text, Instrument Serif for the titles.
const fonts = [
  loadFont({ family: "Geist", url: staticFile("fonts/Geist.woff2"), weight: "100 900" }),
  loadFont({ family: "Geist Mono", url: staticFile("fonts/GeistMono.woff2"), weight: "500" }),
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif.woff2"), weight: "400", style: "normal" }),
  loadFont({ family: "Instrument Serif", url: staticFile("fonts/InstrumentSerif-Italic.woff2"), weight: "400", style: "italic" }),
];
export const fontsReady = Promise.all(fonts);

export const SANS = "Geist, ui-sans-serif, system-ui, sans-serif";
export const MONO = "'Geist Mono', ui-monospace, monospace";
export const SERIF = "'Instrument Serif', Georgia, serif";

// Dark tokens of the site (src/app/globals.css).
export const C = {
  bg: "#0f0f0e",
  bg2: "#151513",
  surface: "#1a1a18",
  surface2: "#222220",
  line: "rgba(255, 252, 245, 0.07)",
  lineStrong: "rgba(255, 252, 245, 0.14)",
  ink: "#f3f1ec",
  ink2: "#b2aea6",
  ink3: "#75726b",
  accent: "#5fd3a8",
  accentInk: "#06251a",
};

export const EASE = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);

export type AppId = "lamio" | "cairn" | "tickup" | "alfred" | "metricove" | "nino" | "maya";

export type App = {
  id: AppId;
  name: string;
  icon: string;
  color: string;
  category: string;
  tagline: string;
  points: string[];
  family: "equipe" | "media";
};

// The catalogue of the suite (src/server/crm.ts), in the order of the site.
export const APPS: App[] = [
  {
    id: "lamio", name: "Lamio", icon: "lamio", color: "#8b63f5", family: "equipe", category: "Messagerie d'équipe",
    tagline: "La messagerie de l'équipe, et la base de la suite.",
    points: ["Canaux, messages directs et fils", "Tout arrive en direct", "App Mac et iPhone"],
  },
  {
    id: "cairn", name: "Cairn", icon: "cairn", color: "#6a71f2", family: "equipe", category: "Notes et coffre",
    tagline: "Tes notes et tes secrets, chez toi.",
    points: ["Notes en Markdown", "Coffre chiffré pour mots de passe", "IA qui répond depuis tes notes"],
  },
  {
    id: "tickup", name: "TickUp", icon: "tickup", color: "#e9e6df", family: "equipe", category: "Gestion de projet",
    tagline: "Projets, epics et tickets, en kanban ou en liste.",
    points: ["Kanban, sprints et Gantt", "Roadmap de tous les projets", "GitHub relié aux tickets"],
  },
  {
    id: "alfred", name: "Alfred", icon: "alfred", color: "#3b9ae6", family: "equipe", category: "Agenda et rendez-vous",
    tagline: "L'assistant de ton temps : agenda et prise de rendez-vous.",
    points: ["Jour, semaine et mois", "Synchro iCloud", "Page publique de rendez-vous"],
  },
  {
    id: "metricove", name: "Metricove", icon: "metricove", color: "#ff6a33", family: "media", category: "Contenu et réseaux sociaux",
    tagline: "Créer, programmer et publier sur tous tes comptes.",
    points: ["Posts créés avec ta marque et l'IA", "Instagram, LinkedIn, YouTube…", "Un seul calendrier éditorial"],
  },
  {
    id: "nino", name: "Nino Studio", icon: "nino", color: "#2fc7b5", family: "media", category: "Studio vidéo",
    tagline: "La régie de ton studio : podcast, table ronde, live.",
    points: ["Pilote OBS depuis l'iPad", "Réalisation automatique", "Invités à distance"],
  },
  {
    id: "maya", name: "Maya Studio", icon: "maya-studio", color: "#ec4d5b", family: "media", category: "Production et diffusion",
    tagline: "Le moteur de production : scènes, compositing et diffusion.",
    points: ["Aperçu et programme", "Diffusion RTMP / SRT", "Nino s'y branche"],
  },
];

export const app = (id: AppId) => APPS.find((a) => a.id === id)!;

export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
