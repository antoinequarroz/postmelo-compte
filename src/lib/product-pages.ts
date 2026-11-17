import {
  AtSign,
  BellRing,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Camera,
  Clapperboard,
  Cloud,
  FileDown,
  Film,
  GitBranch,
  Globe,
  Hash,
  Import,
  KanbanSquare,
  KeyRound,
  Laptop,
  Layers,
  ListTodo,
  type LucideIcon,
  Mail,
  Map as MapIcon,
  MessagesSquare,
  MonitorPlay,
  NotebookPen,
  Paperclip,
  Plug,
  Radio,
  Repeat,
  ScanFace,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

/**
 * What the page of each app says (postmelo.ch/<app>), on top of the catalogue's name, colour and tagline.
 * Everything here describes what the app does today, as the catalogue and its own repository say.
 */
export type ProductPage = {
  /** The words people search for, in the title of the page: « Messagerie d'équipe ». */
  title: string;
  /** The big title, on two lines; the second is set in italics. */
  headline: [string, string];
  intro: string;
  features: { icon: LucideIcon; title: string; text: string }[];
  uses: { who: string; text: string }[];
  /** How it works with the other apps of the suite. */
  links: { id: string; text: string }[];
  faq: { q: string; a: string }[];
  /** For search engines: the systems it runs on. */
  platforms: string;
};

export const PRODUCT_PAGES: Record<string, ProductPage> = {
  lamio: {
    title: "Messagerie d'équipe",
    headline: ["La messagerie", "de toute l'équipe."],
    intro: "Lamio réunit les conversations de ton équipe dans des canaux clairs, avec les fichiers, les fils de réponses et la recherche. C'est la base de la suite : tes collègues s'y connectent avec le même compte que pour toutes les autres applications.",
    features: [
      { icon: Hash, title: "Canaux publics et privés", text: "Un canal par projet, par client ou par équipe. Les privés restent entre les personnes invitées." },
      { icon: MessagesSquare, title: "Messages directs et fils", text: "Une question rapide en privé, une discussion qui part en fil sans noyer le canal." },
      { icon: Paperclip, title: "Fichiers, images et réactions", text: "Glisse un fichier, réagis d'un emoji, mentionne quelqu'un avec @." },
      { icon: BellRing, title: "Tout arrive en direct", text: "Les messages s'affichent à l'instant, avec les non-lus et les notifications." },
      { icon: Search, title: "Recherche ⌘K", text: "Retrouve un message, un canal ou une personne au clavier, en une seconde." },
      { icon: Smartphone, title: "Apps Mac et iPhone", text: "Lamio te suit sur ton Mac et dans ta poche, avec les mêmes conversations." },
    ],
    uses: [
      { who: "Une agence", text: "Un canal par client, où l'équipe partage les retours, les fichiers et les validations." },
      { who: "Un studio", text: "#tournage, #montage et #diffusion : chacun sait où poster et où lire." },
      { who: "Une PME", text: "Les annonces dans #general, les projets dans leurs canaux, les questions en privé." },
    ],
    links: [
      { id: "tickup", text: "Les tickets dont on parle dans un canal se gèrent dans TickUp." },
      { id: "cairn", text: "Les notes et les accès partagés vivent dans Cairn, pas dans le fil." },
      { id: "metricove", text: "Le post validé dans Lamio se programme dans Metricove." },
    ],
    faq: [
      { q: "Lamio remplace-t-il Slack ou WhatsApp ?", a: "Pour les conversations de l'équipe, oui : canaux, messages directs, fils, fichiers, réactions et recherche, comme dans les messageries que tu connais, avec le compte de la suite." },
      { q: "Sur quels appareils marche Lamio ?", a: "Dans le navigateur, et en apps Mac et iPhone." },
      { q: "Qui peut lire un canal privé ?", a: "Seules les personnes invitées dans ce canal. Et depuis ton compte, tu choisis qui a accès à Lamio." },
      { q: "Comment essayer Lamio ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Web, macOS, iOS",
  },

  cairn: {
    title: "Notes et coffre-fort chiffré",
    headline: ["Tes notes et tes secrets,", "chez toi."],
    intro: "Cairn est l'endroit où ton équipe écrit, range et retrouve tout ce qu'elle sait, en Markdown. À côté des notes, un coffre chiffré garde les mots de passe et les clés SSH, et une IA répond à tes questions à partir de toutes tes notes.",
    features: [
      { icon: NotebookPen, title: "Notes en Markdown", text: "Titres, listes, tâches à cocher : on écrit vite, et le texte reste lisible partout." },
      { icon: Import, title: "Import depuis Notion", text: "Tu pars de Notion ? Tes pages arrivent dans Cairn." },
      { icon: KeyRound, title: "Coffre chiffré", text: "Mots de passe, clés SSH et accès serveurs, chiffrés et rangés à l'écart des notes." },
      { icon: Sparkles, title: "Une IA qui lit tes notes", text: "Pose une question, l'IA répond à partir de tout ce que ton équipe a écrit." },
      { icon: ScanFace, title: "Face ID", text: "Sur Mac et iPhone, le coffre s'ouvre d'un regard ou d'une empreinte." },
      { icon: Search, title: "Tout se retrouve", text: "Une recherche sur toutes les notes, au clavier." },
    ],
    uses: [
      { who: "Une agence", text: "Le brief, la charte et les accès de chaque client au même endroit." },
      { who: "Une équipe tech", text: "La doc des serveurs à côté des clés SSH, chiffrées dans le coffre." },
      { who: "Un indépendant", text: "Toutes ses idées, ses process et ses mots de passe, chez lui." },
    ],
    links: [
      { id: "lamio", text: "Le lien d'une note se partage dans un canal Lamio." },
      { id: "tickup", text: "La spec écrite dans Cairn devient des tickets dans TickUp." },
      { id: "metricove", text: "La fiche de marque guide les posts que Metricove rédige." },
    ],
    faq: [
      { q: "Cairn remplace-t-il Notion ?", a: "Pour les notes de l'équipe, oui : Cairn est pensé comme un Notion sur mesure, en Markdown, avec l'import depuis Notion." },
      { q: "Mes mots de passe sont-ils en sécurité ?", a: "Ils vont dans un coffre chiffré, séparé des notes. Sur Mac et iPhone, il s'ouvre avec Face ID." },
      { q: "Que peut faire l'IA ?", a: "Répondre à tes questions à partir de toutes tes notes : retrouver une info, résumer un sujet, lister ce qui revient souvent." },
      { q: "Comment essayer Cairn ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Web, macOS, iOS",
  },

  tickup: {
    title: "Gestion de projet et tickets",
    headline: ["Tes projets,", "ticket par ticket."],
    intro: "TickUp organise le travail de l'équipe en projets, epics et tickets, en kanban ou en liste. Les sprints, le planning Gantt et la roadmap de tous les projets donnent la vue d'ensemble, et GitHub se relie aux tickets.",
    features: [
      { icon: KanbanSquare, title: "Kanban et liste", text: "Glisse les tickets de colonne en colonne, ou travaille en liste triée." },
      { icon: Repeat, title: "Sprints", text: "Planifie ce que l'équipe fait cette semaine, et vois où en est le sprint." },
      { icon: CalendarRange, title: "Planning Gantt", text: "Les dates et les dépendances de chaque projet, sur une ligne du temps." },
      { icon: MapIcon, title: "Roadmap", text: "Tous les projets sur une seule vue, pour savoir ce qui arrive et quand." },
      { icon: GitBranch, title: "GitHub relié", text: "Relie ton dépôt : le code et les tickets avancent ensemble." },
      { icon: Import, title: "Import depuis Linear", text: "Tu viens de Linear ? Tes projets et tes tickets suivent." },
    ],
    uses: [
      { who: "Une équipe produit", text: "Epics, sprints et tickets reliés au code sur GitHub." },
      { who: "Un studio", text: "Chaque épisode est un projet : brief, tournage, montage, diffusion." },
      { who: "Une agence", text: "Un projet par client, et la roadmap pour tenir les délais." },
    ],
    links: [
      { id: "lamio", text: "On parle d'un ticket dans Lamio, on le suit dans TickUp." },
      { id: "cairn", text: "La documentation du projet reste dans Cairn." },
      { id: "alfred", text: "Les échéances côtoient tes rendez-vous dans Alfred." },
    ],
    faq: [
      { q: "TickUp remplace-t-il Linear ou Jira ?", a: "Pour la gestion des projets et des tickets, oui : kanban, liste, sprints, Gantt et roadmap, avec l'import depuis Linear." },
      { q: "TickUp marche-t-il avec GitHub ?", a: "Oui, GitHub se relie aux tickets." },
      { q: "Faut-il être développeur pour l'utiliser ?", a: "Non. Le kanban et les listes servent à toute équipe qui a des tâches à suivre, du studio vidéo à l'agence." },
      { q: "Comment essayer TickUp ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Web",
  },

  alfred: {
    title: "Agenda et prise de rendez-vous",
    headline: ["L'assistant", "de ton temps."],
    intro: "Alfred tient ton agenda et prend tes rendez-vous à ta place. Tu partages ta page publique, la personne choisit un créneau libre, et le rendez-vous arrive dans ton agenda avec un e-mail de confirmation.",
    features: [
      { icon: CalendarDays, title: "Jour, semaine, mois", text: "Les trois vues de ton agenda, et les événements récurrents." },
      { icon: Cloud, title: "Synchro iCloud", text: "Alfred et ton calendrier iCloud restent à jour dans les deux sens." },
      { icon: Globe, title: "Page publique de réservation", text: "Un lien à partager : on y voit tes créneaux libres, et on réserve." },
      { icon: Mail, title: "E-mails automatiques", text: "Confirmation et annulation partent toutes seules, sans que tu écrives." },
      { icon: CalendarClock, title: "Seulement tes créneaux libres", text: "La page publique lit ton agenda : on ne réserve que là où tu es libre." },
      { icon: Users, title: "Le compte de la suite", text: "Tu te connectes avec le même compte que pour Lamio, Cairn et les autres." },
    ],
    uses: [
      { who: "Un podcast", text: "L'invité réserve lui-même son créneau d'enregistrement." },
      { who: "Un indépendant", text: "Ses clients prennent rendez-vous sans échange d'e-mails." },
      { who: "Une équipe", text: "Les réunions et les tournages dans un agenda synchronisé avec iCloud." },
    ],
    links: [
      { id: "nino", text: "L'enregistrement réservé dans Alfred se réalise dans Nino Studio." },
      { id: "lamio", text: "L'équipe en parle dans Lamio, le rendez-vous est dans Alfred." },
      { id: "tickup", text: "Les échéances des projets sont dans TickUp." },
    ],
    faq: [
      { q: "Alfred remplace-t-il Calendly ?", a: "Pour la prise de rendez-vous, oui : une page publique avec tes créneaux libres, et les e-mails de confirmation et d'annulation." },
      { q: "Alfred marche-t-il avec mon calendrier Apple ?", a: "Oui, il se synchronise avec iCloud dans les deux sens." },
      { q: "Alfred est-il prêt ?", a: "Alfred est en bêta : il fonctionne et s'améliore chaque semaine. Demande un accès pour l'essayer." },
      { q: "Comment essayer Alfred ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Web",
  },

  metricove: {
    title: "Planification de posts sur les réseaux sociaux",
    headline: ["Créer, programmer,", "publier partout."],
    intro: "Metricove prépare tes posts et tes carrousels avec ta fiche de marque et l'IA, puis les publie à l'heure prévue sur Instagram, Facebook, X, LinkedIn et YouTube. Un seul calendrier éditorial réunit tous tes comptes.",
    features: [
      { icon: Wand2, title: "Rédigé avec ta fiche de marque", text: "L'IA écrit dans ton ton, avec tes mots et tes couleurs." },
      { icon: Layers, title: "Posts et carrousels", text: "Un visuel, une série de slides, une vidéo : tout se prépare ici." },
      { icon: AtSign, title: "Cinq réseaux", text: "Instagram, Facebook, X, LinkedIn et YouTube, depuis un seul écran." },
      { icon: Send, title: "Publié tout seul", text: "Programme une fois, Metricove publie à l'heure prévue sur chaque compte." },
      { icon: Film, title: "Vidéos et Shorts", text: "Les vidéos et les Shorts partent sur YouTube comme les autres posts." },
      { icon: CalendarDays, title: "Un calendrier éditorial", text: "Tous les posts de tous les comptes, semaine par semaine." },
    ],
    uses: [
      { who: "Un média", text: "Les extraits de chaque épisode programmés sur tous les réseaux." },
      { who: "Une agence", text: "Les comptes de chaque client, dans un calendrier par marque." },
      { who: "Une PME", text: "Un post par semaine sur LinkedIn et Instagram, sans y penser." },
    ],
    links: [
      { id: "nino", text: "Les extraits tournés dans Nino Studio deviennent des posts." },
      { id: "cairn", text: "La fiche de marque écrite dans Cairn guide l'IA." },
      { id: "lamio", text: "Le post se valide dans un canal Lamio avant de partir." },
    ],
    faq: [
      { q: "Sur quels réseaux Metricove publie-t-il ?", a: "Instagram, Facebook, X, LinkedIn et YouTube, vidéos et Shorts compris." },
      { q: "Metricove publie-t-il vraiment tout seul ?", a: "Oui : un post programmé part à l'heure prévue sur les comptes choisis." },
      { q: "À quoi sert la fiche de marque ?", a: "Elle donne à l'IA ton ton, tes mots et tes couleurs, pour des posts qui te ressemblent." },
      { q: "Comment essayer Metricove ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Web",
  },

  nino: {
    title: "Régie vidéo pour podcast et live",
    headline: ["La régie", "de ton studio."],
    intro: "Nino Studio réalise tes podcasts, tables rondes et lives. Il pilote OBS depuis le PC, l'iPad ou le Stream Deck, coupe automatiquement sur la personne qui parle, accueille les invités à distance et prépare les prises pour DaVinci Resolve.",
    features: [
      { icon: MonitorPlay, title: "OBS piloté de partout", text: "Depuis le PC, l'iPad ou le Stream Deck : la régie là où tu es." },
      { icon: Wand2, title: "Réalisation automatique", text: "La caméra suit la voix : Nino coupe sur la personne qui parle." },
      { icon: Users, title: "Invités à distance", text: "Un invité rejoint le plateau depuis chez lui." },
      { icon: Radio, title: "Diffusion en direct", text: "Passe en live sans quitter la régie." },
      { icon: FileDown, title: "Prêt pour DaVinci Resolve", text: "Les prises arrivent rangées pour le montage." },
      { icon: Camera, title: "Plusieurs caméras", text: "Plan large et plans serrés, en un clic ou en automatique." },
    ],
    uses: [
      { who: "Un podcast vidéo", text: "Trois caméras, deux micros, et personne derrière la régie." },
      { who: "Une table ronde", text: "Chaque intervenant à l'image quand il prend la parole." },
      { who: "Un live", text: "Un invité à distance, et la diffusion lancée depuis l'iPad." },
    ],
    links: [
      { id: "maya", text: "Nino se branche sur Maya Studio pour la production et la diffusion." },
      { id: "alfred", text: "L'invité a réservé son créneau dans Alfred." },
      { id: "metricove", text: "Les extraits partent sur les réseaux avec Metricove." },
    ],
    faq: [
      { q: "Faut-il OBS pour utiliser Nino Studio ?", a: "Oui, Nino pilote OBS. Il arrivera aussi sur Maya Studio, le moteur de production de la suite." },
      { q: "Comment marche la réalisation automatique ?", a: "Nino écoute les micros et coupe sur la caméra de la personne qui parle." },
      { q: "Nino Studio est-il prêt ?", a: "Nino est en bêta : il fonctionne en studio et s'améliore chaque semaine. Demande un accès pour l'essayer." },
      { q: "Comment essayer Nino Studio ?", a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
    ],
    platforms: "Windows, macOS, iPadOS",
  },

  maya: {
    title: "Logiciel de production et diffusion vidéo",
    headline: ["Le moteur", "de ta production."],
    intro: "Maya Studio compose tes scènes, mélange tes sources et diffuse en direct. Le mode studio sépare l'aperçu du programme, l'enregistrement se fait en MP4 et la diffusion en RTMP ou SRT. Tout se pilote, et Nino Studio s'y branche.",
    features: [
      { icon: Layers, title: "Scènes et sources", text: "Caméras, écran, logo et titres, composés scène par scène." },
      { icon: MonitorPlay, title: "Mode studio", text: "Prépare la scène suivante dans l'aperçu, envoie-la au programme." },
      { icon: Clapperboard, title: "Enregistrement MP4", text: "Chaque émission enregistrée, prête à monter ou à publier." },
      { icon: Radio, title: "Diffusion RTMP et SRT", text: "En direct sur ta plateforme, avec un flux fiable." },
      { icon: Plug, title: "Entièrement pilotable", text: "Tout se commande à distance, et Nino Studio s'y branche." },
      { icon: Laptop, title: "Windows et macOS", text: "Une app desktop pour les deux systèmes." },
    ],
    uses: [
      { who: "Un podcast vidéo", text: "Intro, plateau, invité, écran partagé et générique de fin." },
      { who: "Un événement", text: "La captation diffusée en SRT et enregistrée en même temps." },
      { who: "Une régie automatisée", text: "Nino Studio commande Maya, sans personne aux manettes." },
    ],
    links: [
      { id: "nino", text: "Nino Studio commande Maya et réalise à ta place." },
      { id: "metricove", text: "Les extraits de l'émission se programment dans Metricove." },
      { id: "alfred", text: "Les invités réservent leur passage dans Alfred." },
    ],
    faq: [
      { q: "Maya Studio remplace-t-il OBS ?", a: "C'est le même genre de logiciel : scènes, sources, mode studio, enregistrement et diffusion, pensé pour se piloter de bout en bout." },
      { q: "Quand sort Maya Studio ?", a: "Maya arrive bientôt. Laisse ton adresse dans le formulaire pour être prévenu du lancement." },
      { q: "Sur quels systèmes ?", a: "En app desktop pour Windows et macOS." },
      { q: "Quels protocoles de diffusion ?", a: "RTMP et SRT, avec l'enregistrement en MP4." },
    ],
    platforms: "Windows, macOS",
  },
};

/** The page of an app added in the admin without its own text: written from the catalogue. */
export function fallbackPage(p: { name: string; tagline: string; category: string; description: string }): ProductPage {
  const points = p.description
    .split("\n")
    .map((l) => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
  return {
    title: p.category || p.name,
    headline: [p.name, p.category ? p.category.toLowerCase() + "." : ""],
    intro: p.tagline,
    features: points.map((text) => ({ icon: ListTodo, title: text, text: "" })),
    uses: [],
    links: [],
    faq: [{ q: `Comment essayer ${p.name} ?`, a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." }],
    platforms: "Web",
  };
}

