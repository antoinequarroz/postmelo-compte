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
import type { Locale } from "./i18n";

/**
 * What the page of each app says (postmelo.ch/<app>, /en/<app>, /de/<app>), on top of the catalogue's
 * name, colour and tagline. Everything here describes what the app does today, as the catalogue and
 * its own repository say.
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

type PageText = Omit<ProductPage, "features" | "platforms"> & { features: { title: string; text: string }[] };

/** The icon of each feature, in the order of the texts, and the systems each app runs on: the same in every language. */
const ICONS: Record<string, LucideIcon[]> = {
  lamio: [Hash, MessagesSquare, Paperclip, BellRing, Search, Smartphone],
  cairn: [NotebookPen, Import, KeyRound, Sparkles, ScanFace, Search],
  tickup: [KanbanSquare, Repeat, CalendarRange, MapIcon, GitBranch, Import],
  alfred: [CalendarDays, Cloud, Globe, Mail, CalendarClock, Users],
  metricove: [Wand2, Layers, AtSign, Send, Film, CalendarDays],
  nino: [MonitorPlay, Wand2, Users, Radio, FileDown, Camera],
  maya: [Layers, MonitorPlay, Clapperboard, Radio, Plug, Laptop],
};

const PLATFORMS: Record<string, string> = {
  lamio: "Web, macOS, iOS",
  cairn: "Web, macOS, iOS",
  tickup: "Web",
  alfred: "Web",
  metricove: "Web",
  nino: "Windows, macOS, iPadOS",
  maya: "Windows, macOS",
};

const PAGES: Record<Locale, Record<string, PageText>> = {
  fr: {
    lamio: {
      title: "Messagerie d'équipe",
      headline: ["La messagerie", "de toute l'équipe."],
      intro: "Lamio réunit les conversations de ton équipe dans des canaux clairs, avec les fichiers, les fils de réponses et la recherche. C'est la base de la suite : tes collègues s'y connectent avec le même compte que pour toutes les autres applications.",
      features: [
        { title: "Canaux publics et privés", text: "Un canal par projet, par client ou par équipe. Les privés restent entre les personnes invitées." },
        { title: "Messages directs et fils", text: "Une question rapide en privé, une discussion qui part en fil sans noyer le canal." },
        { title: "Fichiers, images et réactions", text: "Glisse un fichier, réagis d'un emoji, mentionne quelqu'un avec @." },
        { title: "Tout arrive en direct", text: "Les messages s'affichent à l'instant, avec les non-lus et les notifications." },
        { title: "Recherche ⌘K", text: "Retrouve un message, un canal ou une personne au clavier, en une seconde." },
        { title: "Apps Mac et iPhone", text: "Lamio te suit sur ton Mac et dans ta poche, avec les mêmes conversations." },
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
    },

    cairn: {
      title: "Notes et coffre-fort chiffré",
      headline: ["Tes notes et tes secrets,", "chez toi."],
      intro: "Cairn est l'endroit où ton équipe écrit, range et retrouve tout ce qu'elle sait, en Markdown. À côté des notes, un coffre chiffré garde les mots de passe et les clés SSH, et une IA répond à tes questions à partir de toutes tes notes.",
      features: [
        { title: "Notes en Markdown", text: "Titres, listes, tâches à cocher : on écrit vite, et le texte reste lisible partout." },
        { title: "Import depuis Notion", text: "Tu pars de Notion ? Tes pages arrivent dans Cairn." },
        { title: "Coffre chiffré", text: "Mots de passe, clés SSH et accès serveurs, chiffrés et rangés à l'écart des notes." },
        { title: "Une IA qui lit tes notes", text: "Pose une question, l'IA répond à partir de tout ce que ton équipe a écrit." },
        { title: "Face ID", text: "Sur Mac et iPhone, le coffre s'ouvre d'un regard ou d'une empreinte." },
        { title: "Tout se retrouve", text: "Une recherche sur toutes les notes, au clavier." },
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
    },

    tickup: {
      title: "Gestion de projet et tickets",
      headline: ["Tes projets,", "ticket par ticket."],
      intro: "TickUp organise le travail de l'équipe en projets, epics et tickets, en kanban ou en liste. Les sprints, le planning Gantt et la roadmap de tous les projets donnent la vue d'ensemble, et GitHub se relie aux tickets.",
      features: [
        { title: "Kanban et liste", text: "Glisse les tickets de colonne en colonne, ou travaille en liste triée." },
        { title: "Sprints", text: "Planifie ce que l'équipe fait cette semaine, et vois où en est le sprint." },
        { title: "Planning Gantt", text: "Les dates et les dépendances de chaque projet, sur une ligne du temps." },
        { title: "Roadmap", text: "Tous les projets sur une seule vue, pour savoir ce qui arrive et quand." },
        { title: "GitHub relié", text: "Relie ton dépôt : le code et les tickets avancent ensemble." },
        { title: "Import depuis Linear", text: "Tu viens de Linear ? Tes projets et tes tickets suivent." },
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
    },

    alfred: {
      title: "Agenda et prise de rendez-vous",
      headline: ["L'assistant", "de ton temps."],
      intro: "Alfred tient ton agenda et prend tes rendez-vous à ta place. Tu partages ta page publique, la personne choisit un créneau libre, et le rendez-vous arrive dans ton agenda avec un e-mail de confirmation.",
      features: [
        { title: "Jour, semaine, mois", text: "Les trois vues de ton agenda, et les événements récurrents." },
        { title: "Synchro iCloud", text: "Alfred et ton calendrier iCloud restent à jour dans les deux sens." },
        { title: "Page publique de réservation", text: "Un lien à partager : on y voit tes créneaux libres, et on réserve." },
        { title: "E-mails automatiques", text: "Confirmation et annulation partent toutes seules, sans que tu écrives." },
        { title: "Seulement tes créneaux libres", text: "La page publique lit ton agenda : on ne réserve que là où tu es libre." },
        { title: "Le compte de la suite", text: "Tu te connectes avec le même compte que pour Lamio, Cairn et les autres." },
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
    },

    metricove: {
      title: "Planification de posts sur les réseaux sociaux",
      headline: ["Créer, programmer,", "publier partout."],
      intro: "Metricove prépare tes posts et tes carrousels avec ta fiche de marque et l'IA, puis les publie à l'heure prévue sur Instagram, Facebook, X, LinkedIn et YouTube. Un seul calendrier éditorial réunit tous tes comptes.",
      features: [
        { title: "Rédigé avec ta fiche de marque", text: "L'IA écrit dans ton ton, avec tes mots et tes couleurs." },
        { title: "Posts et carrousels", text: "Un visuel, une série de slides, une vidéo : tout se prépare ici." },
        { title: "Cinq réseaux", text: "Instagram, Facebook, X, LinkedIn et YouTube, depuis un seul écran." },
        { title: "Publié tout seul", text: "Programme une fois, Metricove publie à l'heure prévue sur chaque compte." },
        { title: "Vidéos et Shorts", text: "Les vidéos et les Shorts partent sur YouTube comme les autres posts." },
        { title: "Un calendrier éditorial", text: "Tous les posts de tous les comptes, semaine par semaine." },
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
    },

    nino: {
      title: "Régie vidéo pour podcast et live",
      headline: ["La régie", "de ton studio."],
      intro: "Nino Studio réalise tes podcasts, tables rondes et lives. Il pilote OBS depuis le PC, l'iPad ou le Stream Deck, coupe automatiquement sur la personne qui parle, accueille les invités à distance et prépare les prises pour DaVinci Resolve.",
      features: [
        { title: "OBS piloté de partout", text: "Depuis le PC, l'iPad ou le Stream Deck : la régie là où tu es." },
        { title: "Réalisation automatique", text: "La caméra suit la voix : Nino coupe sur la personne qui parle." },
        { title: "Invités à distance", text: "Un invité rejoint le plateau depuis chez lui." },
        { title: "Diffusion en direct", text: "Passe en live sans quitter la régie." },
        { title: "Prêt pour DaVinci Resolve", text: "Les prises arrivent rangées pour le montage." },
        { title: "Plusieurs caméras", text: "Plan large et plans serrés, en un clic ou en automatique." },
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
    },

    maya: {
      title: "Logiciel de production et diffusion vidéo",
      headline: ["Le moteur", "de ta production."],
      intro: "Maya Studio compose tes scènes, mélange tes sources et diffuse en direct. Le mode studio sépare l'aperçu du programme, l'enregistrement se fait en MP4 et la diffusion en RTMP ou SRT. Tout se pilote, et Nino Studio s'y branche.",
      features: [
        { title: "Scènes et sources", text: "Caméras, écran, logo et titres, composés scène par scène." },
        { title: "Mode studio", text: "Prépare la scène suivante dans l'aperçu, envoie-la au programme." },
        { title: "Enregistrement MP4", text: "Chaque émission enregistrée, prête à monter ou à publier." },
        { title: "Diffusion RTMP et SRT", text: "En direct sur ta plateforme, avec un flux fiable." },
        { title: "Entièrement pilotable", text: "Tout se commande à distance, et Nino Studio s'y branche." },
        { title: "Windows et macOS", text: "Une app desktop pour les deux systèmes." },
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
    },
  },

  en: {
    lamio: {
      title: "Team messaging",
      headline: ["Messaging", "for the whole team."],
      intro: "Lamio brings your team's conversations together in clear channels, with files, reply threads and search. It's the base of the suite: your colleagues sign in with the same account as for every other app.",
      features: [
        { title: "Public and private channels", text: "One channel per project, client or team. Private ones stay between the people invited." },
        { title: "Direct messages and threads", text: "A quick question in private, a discussion that moves to a thread without flooding the channel." },
        { title: "Files, images and reactions", text: "Drop a file, react with an emoji, mention someone with @." },
        { title: "Everything arrives live", text: "Messages show up instantly, with unread counts and notifications." },
        { title: "⌘K search", text: "Find a message, a channel or a person from the keyboard, in a second." },
        { title: "Mac and iPhone apps", text: "Lamio follows you on your Mac and in your pocket, with the same conversations." },
      ],
      uses: [
        { who: "An agency", text: "One channel per client, where the team shares feedback, files and approvals." },
        { who: "A studio", text: "#shoot, #edit and #broadcast: everyone knows where to post and where to read." },
        { who: "A small business", text: "Announcements in #general, projects in their channels, questions in private." },
      ],
      links: [
        { id: "tickup", text: "The tickets discussed in a channel are managed in TickUp." },
        { id: "cairn", text: "Notes and shared logins live in Cairn, not in the thread." },
        { id: "metricove", text: "The post approved in Lamio gets scheduled in Metricove." },
      ],
      faq: [
        { q: "Does Lamio replace Slack or WhatsApp?", a: "For your team's conversations, yes: channels, direct messages, threads, files, reactions and search, like the messaging apps you know, with the suite's account." },
        { q: "Which devices does Lamio run on?", a: "In the browser, and as Mac and iPhone apps." },
        { q: "Who can read a private channel?", a: "Only the people invited to that channel. And from your account, you choose who has access to Lamio." },
        { q: "How can I try Lamio?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    cairn: {
      title: "Notes and encrypted vault",
      headline: ["Your notes and secrets,", "at home."],
      intro: "Cairn is where your team writes, files and finds everything it knows, in Markdown. Next to the notes, an encrypted vault keeps passwords and SSH keys, and an AI answers your questions from all your notes.",
      features: [
        { title: "Notes in Markdown", text: "Headings, lists, checkboxes: you write fast, and the text stays readable everywhere." },
        { title: "Import from Notion", text: "Coming from Notion? Your pages move into Cairn." },
        { title: "Encrypted vault", text: "Passwords, SSH keys and server logins, encrypted and kept apart from the notes." },
        { title: "An AI that reads your notes", text: "Ask a question, the AI answers from everything your team has written." },
        { title: "Face ID", text: "On Mac and iPhone, the vault opens with a glance or a fingerprint." },
        { title: "Everything can be found", text: "One search across all notes, from the keyboard." },
      ],
      uses: [
        { who: "An agency", text: "Each client's brief, brand guidelines and logins in one place." },
        { who: "A tech team", text: "Server docs right next to the SSH keys, encrypted in the vault." },
        { who: "A freelancer", text: "All their ideas, processes and passwords, under their own roof." },
      ],
      links: [
        { id: "lamio", text: "A note's link gets shared in a Lamio channel." },
        { id: "tickup", text: "The spec written in Cairn becomes tickets in TickUp." },
        { id: "metricove", text: "The brand profile guides the posts Metricove writes." },
      ],
      faq: [
        { q: "Does Cairn replace Notion?", a: "For your team's notes, yes: Cairn is designed as a tailor-made Notion, in Markdown, with import from Notion." },
        { q: "Are my passwords safe?", a: "They go into an encrypted vault, separate from the notes. On Mac and iPhone, it opens with Face ID." },
        { q: "What can the AI do?", a: "Answer your questions from all your notes: find a piece of information, sum up a topic, list what keeps coming up." },
        { q: "How can I try Cairn?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    tickup: {
      title: "Project management and tickets",
      headline: ["Your projects,", "ticket by ticket."],
      intro: "TickUp organises your team's work into projects, epics and tickets, as a kanban or a list. Sprints, the Gantt plan and the roadmap across all projects give the big picture, and GitHub links up with the tickets.",
      features: [
        { title: "Kanban and list", text: "Drag tickets from column to column, or work in a sorted list." },
        { title: "Sprints", text: "Plan what the team does this week, and see where the sprint stands." },
        { title: "Gantt plan", text: "Each project's dates and dependencies, on a timeline." },
        { title: "Roadmap", text: "All projects in a single view, to know what's coming and when." },
        { title: "GitHub connected", text: "Link your repository: code and tickets move forward together." },
        { title: "Import from Linear", text: "Coming from Linear? Your projects and tickets come along." },
      ],
      uses: [
        { who: "A product team", text: "Epics, sprints and tickets linked to the code on GitHub." },
        { who: "A studio", text: "Each episode is a project: brief, shoot, edit, broadcast." },
        { who: "An agency", text: "One project per client, and the roadmap to meet deadlines." },
      ],
      links: [
        { id: "lamio", text: "Talk about a ticket in Lamio, follow it in TickUp." },
        { id: "cairn", text: "The project documentation stays in Cairn." },
        { id: "alfred", text: "Deadlines sit next to your appointments in Alfred." },
      ],
      faq: [
        { q: "Does TickUp replace Linear or Jira?", a: "For managing projects and tickets, yes: kanban, list, sprints, Gantt and roadmap, with import from Linear." },
        { q: "Does TickUp work with GitHub?", a: "Yes, GitHub links up with the tickets." },
        { q: "Do I need to be a developer to use it?", a: "No. Kanban boards and lists work for any team with tasks to track, from video studios to agencies." },
        { q: "How can I try TickUp?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    alfred: {
      title: "Calendar and appointment booking",
      headline: ["The assistant", "for your time."],
      intro: "Alfred keeps your calendar and takes bookings for you. You share your public page, the person picks a free slot, and the appointment lands in your calendar with a confirmation email.",
      features: [
        { title: "Day, week, month", text: "The three views of your calendar, plus recurring events." },
        { title: "iCloud sync", text: "Alfred and your iCloud calendar stay up to date both ways." },
        { title: "Public booking page", text: "A link to share: people see your free slots and book." },
        { title: "Automatic emails", text: "Confirmations and cancellations go out on their own, without you writing a word." },
        { title: "Only your free slots", text: "The public page reads your calendar: people can only book when you're free." },
        { title: "The suite's account", text: "You sign in with the same account as for Lamio, Cairn and the others." },
      ],
      uses: [
        { who: "A podcast", text: "Guests book their own recording slot." },
        { who: "A freelancer", text: "Clients book appointments without any back-and-forth emails." },
        { who: "A team", text: "Meetings and shoots in a calendar synced with iCloud." },
      ],
      links: [
        { id: "nino", text: "The recording booked in Alfred is directed in Nino Studio." },
        { id: "lamio", text: "The team talks about it in Lamio, the appointment is in Alfred." },
        { id: "tickup", text: "Project deadlines are in TickUp." },
      ],
      faq: [
        { q: "Does Alfred replace Calendly?", a: "For booking appointments, yes: a public page with your free slots, plus confirmation and cancellation emails." },
        { q: "Does Alfred work with my Apple calendar?", a: "Yes, it syncs with iCloud both ways." },
        { q: "Is Alfred ready?", a: "Alfred is in beta: it works and gets better every week. Request access to try it." },
        { q: "How can I try Alfred?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    metricove: {
      title: "Social media post scheduling",
      headline: ["Create, schedule,", "publish everywhere."],
      intro: "Metricove prepares your posts and carousels with your brand profile and AI, then publishes them at the planned time on Instagram, Facebook, X, LinkedIn and YouTube. One editorial calendar brings all your accounts together.",
      features: [
        { title: "Written with your brand profile", text: "The AI writes in your tone, with your words and your colours." },
        { title: "Posts and carousels", text: "One visual, a series of slides, a video: it's all prepared here." },
        { title: "Five networks", text: "Instagram, Facebook, X, LinkedIn and YouTube, from a single screen." },
        { title: "Published on its own", text: "Schedule once, and Metricove publishes on each account at the planned time." },
        { title: "Videos and Shorts", text: "Videos and Shorts go out on YouTube like any other post." },
        { title: "An editorial calendar", text: "Every post from every account, week by week." },
      ],
      uses: [
        { who: "A media outlet", text: "Clips from each episode scheduled on every network." },
        { who: "An agency", text: "Each client's accounts, in one calendar per brand." },
        { who: "A small business", text: "One post a week on LinkedIn and Instagram, without thinking about it." },
      ],
      links: [
        { id: "nino", text: "Clips shot in Nino Studio become posts." },
        { id: "cairn", text: "The brand profile written in Cairn guides the AI." },
        { id: "lamio", text: "The post gets approved in a Lamio channel before it goes out." },
      ],
      faq: [
        { q: "Which networks does Metricove publish to?", a: "Instagram, Facebook, X, LinkedIn and YouTube, videos and Shorts included." },
        { q: "Does Metricove really publish on its own?", a: "Yes: a scheduled post goes out at the planned time on the chosen accounts." },
        { q: "What is the brand profile for?", a: "It gives the AI your tone, your words and your colours, for posts that sound like you." },
        { q: "How can I try Metricove?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    nino: {
      title: "Video control room for podcasts and live shows",
      headline: ["The control room", "of your studio."],
      intro: "Nino Studio directs your podcasts, panel discussions and live shows. It controls OBS from the PC, the iPad or the Stream Deck, cuts automatically to whoever is speaking, welcomes remote guests and prepares the takes for DaVinci Resolve.",
      features: [
        { title: "OBS controlled from anywhere", text: "From the PC, the iPad or the Stream Deck: the control room wherever you are." },
        { title: "Auto-directing", text: "The camera follows the voice: Nino cuts to whoever is speaking." },
        { title: "Remote guests", text: "A guest joins the set from home." },
        { title: "Live broadcast", text: "Go live without leaving the control room." },
        { title: "Ready for DaVinci Resolve", text: "The takes arrive organised for editing." },
        { title: "Multiple cameras", text: "Wide shot and close-ups, in one click or automatically." },
      ],
      uses: [
        { who: "A video podcast", text: "Three cameras, two mics, and nobody behind the control desk." },
        { who: "A panel discussion", text: "Each speaker on screen when they take the floor." },
        { who: "A live show", text: "A remote guest, and the broadcast started from the iPad." },
      ],
      links: [
        { id: "maya", text: "Nino plugs into Maya Studio for production and broadcast." },
        { id: "alfred", text: "The guest booked their slot in Alfred." },
        { id: "metricove", text: "Clips go out on social media with Metricove." },
      ],
      faq: [
        { q: "Do I need OBS to use Nino Studio?", a: "Yes, Nino controls OBS. It will also come to Maya Studio, the suite's production engine." },
        { q: "How does auto-directing work?", a: "Nino listens to the mics and cuts to the camera of whoever is speaking." },
        { q: "Is Nino Studio ready?", a: "Nino is in beta: it works in the studio and gets better every week. Request access to try it." },
        { q: "How can I try Nino Studio?", a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
      ],
    },

    maya: {
      title: "Video production and streaming software",
      headline: ["The engine", "of your production."],
      intro: "Maya Studio composes your scenes, mixes your sources and streams live. Studio mode separates the preview from the program, recording is done in MP4 and streaming in RTMP or SRT. Everything can be controlled remotely, and Nino Studio plugs into it.",
      features: [
        { title: "Scenes and sources", text: "Cameras, screen, logo and titles, composed scene by scene." },
        { title: "Studio mode", text: "Set up the next scene in the preview, send it to the program." },
        { title: "MP4 recording", text: "Every show recorded, ready to edit or publish." },
        { title: "RTMP and SRT streaming", text: "Live on your platform, with a reliable stream." },
        { title: "Fully controllable", text: "Everything can be driven remotely, and Nino Studio plugs into it." },
        { title: "Windows and macOS", text: "A desktop app for both systems." },
      ],
      uses: [
        { who: "A video podcast", text: "Intro, set, guest, shared screen and closing credits." },
        { who: "An event", text: "The coverage streamed over SRT and recorded at the same time." },
        { who: "An automated control room", text: "Nino Studio drives Maya, with nobody at the controls." },
      ],
      links: [
        { id: "nino", text: "Nino Studio drives Maya and directs for you." },
        { id: "metricove", text: "Clips from the show get scheduled in Metricove." },
        { id: "alfred", text: "Guests book their appearance in Alfred." },
      ],
      faq: [
        { q: "Does Maya Studio replace OBS?", a: "It's the same kind of software: scenes, sources, studio mode, recording and streaming, designed to be controlled end to end." },
        { q: "When is Maya Studio coming out?", a: "Maya is coming soon. Leave your address in the form to be notified at launch." },
        { q: "Which systems does it run on?", a: "As a desktop app for Windows and macOS." },
        { q: "Which streaming protocols?", a: "RTMP and SRT, with recording in MP4." },
      ],
    },
  },

  de: {
    lamio: {
      title: "Team-Messenger",
      headline: ["Der Messenger", "für das ganze Team."],
      intro: "Lamio bündelt die Gespräche deines Teams in übersichtlichen Kanälen, mit Dateien, Antwort-Threads und Suche. Es ist die Basis der Suite: Deine Kolleginnen und Kollegen melden sich mit demselben Konto an wie bei allen anderen Apps.",
      features: [
        { title: "Öffentliche und private Kanäle", text: "Ein Kanal pro Projekt, Kunde oder Team. Private Kanäle bleiben unter den eingeladenen Personen." },
        { title: "Direktnachrichten und Threads", text: "Eine kurze Frage privat, eine Diskussion im Thread, ohne den Kanal zu überfluten." },
        { title: "Dateien, Bilder und Reaktionen", text: "Zieh eine Datei hinein, reagiere mit einem Emoji, erwähne jemanden mit @." },
        { title: "Alles kommt live an", text: "Nachrichten erscheinen sofort, mit Ungelesen-Zähler und Benachrichtigungen." },
        { title: "Suche mit ⌘K", text: "Finde eine Nachricht, einen Kanal oder eine Person per Tastatur, in einer Sekunde." },
        { title: "Apps für Mac und iPhone", text: "Lamio begleitet dich auf dem Mac und in der Hosentasche, mit denselben Gesprächen." },
      ],
      uses: [
        { who: "Eine Agentur", text: "Ein Kanal pro Kunde, in dem das Team Feedback, Dateien und Freigaben teilt." },
        { who: "Ein Studio", text: "#dreh, #schnitt und #ausstrahlung: Alle wissen, wo sie posten und wo sie lesen." },
        { who: "Ein KMU", text: "Ankündigungen in #general, Projekte in ihren Kanälen, Fragen privat." },
      ],
      links: [
        { id: "tickup", text: "Die Tickets, über die in einem Kanal gesprochen wird, verwaltest du in TickUp." },
        { id: "cairn", text: "Notizen und geteilte Zugänge leben in Cairn, nicht im Verlauf." },
        { id: "metricove", text: "Der in Lamio freigegebene Post wird in Metricove eingeplant." },
      ],
      faq: [
        { q: "Ersetzt Lamio Slack oder WhatsApp?", a: "Für die Gespräche im Team, ja: Kanäle, Direktnachrichten, Threads, Dateien, Reaktionen und Suche, wie in den Messengern, die du kennst, mit dem Konto der Suite." },
        { q: "Auf welchen Geräten läuft Lamio?", a: "Im Browser sowie als App für Mac und iPhone." },
        { q: "Wer kann einen privaten Kanal lesen?", a: "Nur die Personen, die in diesen Kanal eingeladen sind. Und in deinem Konto bestimmst du, wer Zugriff auf Lamio hat." },
        { q: "Wie kann ich Lamio testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    cairn: {
      title: "Notizen und verschlüsselter Tresor",
      headline: ["Deine Notizen und Geheimnisse,", "bei dir."],
      intro: "In Cairn schreibt, ordnet und findet dein Team alles, was es weiss, in Markdown. Neben den Notizen bewahrt ein verschlüsselter Tresor Passwörter und SSH-Schlüssel auf, und eine KI beantwortet deine Fragen anhand all deiner Notizen.",
      features: [
        { title: "Notizen in Markdown", text: "Titel, Listen, Aufgaben zum Abhaken: Du schreibst schnell, und der Text bleibt überall lesbar." },
        { title: "Import aus Notion", text: "Du kommst von Notion? Deine Seiten ziehen in Cairn um." },
        { title: "Verschlüsselter Tresor", text: "Passwörter, SSH-Schlüssel und Serverzugänge, verschlüsselt und getrennt von den Notizen." },
        { title: "Eine KI, die deine Notizen liest", text: "Stell eine Frage, die KI antwortet anhand von allem, was dein Team geschrieben hat." },
        { title: "Face ID", text: "Auf Mac und iPhone öffnet sich der Tresor mit einem Blick oder einem Fingerabdruck." },
        { title: "Alles lässt sich finden", text: "Eine Suche über alle Notizen, per Tastatur." },
      ],
      uses: [
        { who: "Eine Agentur", text: "Briefing, Leitfaden und Zugänge jedes Kunden an einem Ort." },
        { who: "Ein Tech-Team", text: "Die Server-Doku direkt neben den SSH-Schlüsseln, verschlüsselt im Tresor." },
        { who: "Eine Freelancerin", text: "Alle Ideen, Abläufe und Passwörter, bei sich zu Hause." },
      ],
      links: [
        { id: "lamio", text: "Den Link zu einer Notiz teilst du in einem Lamio-Kanal." },
        { id: "tickup", text: "Die in Cairn geschriebene Spezifikation wird in TickUp zu Tickets." },
        { id: "metricove", text: "Das Markenprofil leitet die Posts, die Metricove schreibt." },
      ],
      faq: [
        { q: "Ersetzt Cairn Notion?", a: "Für die Notizen des Teams, ja: Cairn ist wie ein massgeschneidertes Notion gedacht, in Markdown, mit Import aus Notion." },
        { q: "Sind meine Passwörter sicher?", a: "Sie liegen in einem verschlüsselten Tresor, getrennt von den Notizen. Auf Mac und iPhone öffnet er sich mit Face ID." },
        { q: "Was kann die KI?", a: "Deine Fragen anhand all deiner Notizen beantworten: eine Info wiederfinden, ein Thema zusammenfassen, auflisten, was oft vorkommt." },
        { q: "Wie kann ich Cairn testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    tickup: {
      title: "Projektmanagement und Tickets",
      headline: ["Deine Projekte,", "Ticket für Ticket."],
      intro: "TickUp organisiert die Arbeit des Teams in Projekten, Epics und Tickets, als Kanban oder als Liste. Sprints, Gantt-Planung und die Roadmap über alle Projekte geben den Überblick, und GitHub lässt sich mit den Tickets verknüpfen.",
      features: [
        { title: "Kanban und Liste", text: "Zieh Tickets von Spalte zu Spalte oder arbeite in einer sortierten Liste." },
        { title: "Sprints", text: "Plane, was das Team diese Woche macht, und sieh, wo der Sprint steht." },
        { title: "Gantt-Planung", text: "Termine und Abhängigkeiten jedes Projekts auf einer Zeitachse." },
        { title: "Roadmap", text: "Alle Projekte in einer Ansicht, damit du weisst, was wann kommt." },
        { title: "GitHub verbunden", text: "Verknüpfe dein Repository: Code und Tickets kommen gemeinsam voran." },
        { title: "Import aus Linear", text: "Du kommst von Linear? Deine Projekte und Tickets ziehen mit." },
      ],
      uses: [
        { who: "Ein Produktteam", text: "Epics, Sprints und Tickets, verknüpft mit dem Code auf GitHub." },
        { who: "Ein Studio", text: "Jede Folge ist ein Projekt: Briefing, Dreh, Schnitt, Ausstrahlung." },
        { who: "Eine Agentur", text: "Ein Projekt pro Kunde, und die Roadmap, um Fristen einzuhalten." },
      ],
      links: [
        { id: "lamio", text: "Über ein Ticket sprichst du in Lamio, verfolgen tust du es in TickUp." },
        { id: "cairn", text: "Die Projektdokumentation bleibt in Cairn." },
        { id: "alfred", text: "Fristen stehen in Alfred direkt neben deinen Terminen." },
      ],
      faq: [
        { q: "Ersetzt TickUp Linear oder Jira?", a: "Für die Verwaltung von Projekten und Tickets, ja: Kanban, Liste, Sprints, Gantt und Roadmap, mit Import aus Linear." },
        { q: "Funktioniert TickUp mit GitHub?", a: "Ja, GitHub lässt sich mit den Tickets verknüpfen." },
        { q: "Muss ich Entwickler sein, um es zu nutzen?", a: "Nein. Kanban und Listen eignen sich für jedes Team mit Aufgaben, vom Videostudio bis zur Agentur." },
        { q: "Wie kann ich TickUp testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    alfred: {
      title: "Kalender und Terminbuchung",
      headline: ["Der Assistent", "für deine Zeit."],
      intro: "Alfred führt deinen Kalender und nimmt Termine für dich an. Du teilst deine öffentliche Seite, die Person wählt eine freie Zeit, und der Termin landet mit einer Bestätigungs-E-Mail in deinem Kalender.",
      features: [
        { title: "Tag, Woche, Monat", text: "Die drei Ansichten deines Kalenders, dazu wiederkehrende Termine." },
        { title: "iCloud-Sync", text: "Alfred und dein iCloud-Kalender bleiben in beide Richtungen aktuell." },
        { title: "Öffentliche Buchungsseite", text: "Ein Link zum Teilen: Man sieht deine freien Zeiten und bucht." },
        { title: "Automatische E-Mails", text: "Bestätigungen und Absagen gehen von selbst raus, ohne dass du schreiben musst." },
        { title: "Nur deine freien Zeiten", text: "Die öffentliche Seite liest deinen Kalender: Gebucht wird nur, wenn du frei bist." },
        { title: "Das Konto der Suite", text: "Du meldest dich mit demselben Konto an wie bei Lamio, Cairn und den anderen." },
      ],
      uses: [
        { who: "Ein Podcast", text: "Gäste buchen ihre Aufnahmezeit selbst." },
        { who: "Ein Freelancer", text: "Kundinnen und Kunden buchen Termine ohne E-Mail-Pingpong." },
        { who: "Ein Team", text: "Meetings und Drehs in einem Kalender, der mit iCloud synchronisiert ist." },
      ],
      links: [
        { id: "nino", text: "Die in Alfred gebuchte Aufnahme wird in Nino Studio produziert." },
        { id: "lamio", text: "Das Team bespricht es in Lamio, der Termin steht in Alfred." },
        { id: "tickup", text: "Die Projektfristen stehen in TickUp." },
      ],
      faq: [
        { q: "Ersetzt Alfred Calendly?", a: "Für die Terminbuchung, ja: eine öffentliche Seite mit deinen freien Zeiten, dazu Bestätigungs- und Absage-E-Mails." },
        { q: "Funktioniert Alfred mit meinem Apple-Kalender?", a: "Ja, er synchronisiert sich in beide Richtungen mit iCloud." },
        { q: "Ist Alfred schon bereit?", a: "Alfred ist in der Beta: Er funktioniert und wird jede Woche besser. Frag einen Zugang an, um ihn zu testen." },
        { q: "Wie kann ich Alfred testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    metricove: {
      title: "Social-Media-Posts planen",
      headline: ["Erstellen, planen,", "überall posten."],
      intro: "Metricove bereitet deine Posts und Karussells mit deinem Markenprofil und KI vor und veröffentlicht sie zur geplanten Zeit auf Instagram, Facebook, X, LinkedIn und YouTube. Ein einziger Redaktionskalender vereint all deine Konten.",
      features: [
        { title: "Mit deinem Markenprofil geschrieben", text: "Die KI schreibt in deinem Ton, mit deinen Worten und deinen Farben." },
        { title: "Posts und Karussells", text: "Ein Visual, eine Slide-Serie, ein Video: Alles wird hier vorbereitet." },
        { title: "Fünf Netzwerke", text: "Instagram, Facebook, X, LinkedIn und YouTube, von einem einzigen Bildschirm aus." },
        { title: "Postet von selbst", text: "Einmal einplanen, Metricove veröffentlicht zur geplanten Zeit auf jedem Konto." },
        { title: "Videos und Shorts", text: "Videos und Shorts gehen auf YouTube raus wie alle anderen Posts." },
        { title: "Ein Redaktionskalender", text: "Alle Posts aller Konten, Woche für Woche." },
      ],
      uses: [
        { who: "Ein Medium", text: "Ausschnitte jeder Folge, eingeplant auf allen Netzwerken." },
        { who: "Eine Agentur", text: "Die Konten jedes Kunden, in einem Kalender pro Marke." },
        { who: "Ein KMU", text: "Ein Post pro Woche auf LinkedIn und Instagram, ohne daran denken zu müssen." },
      ],
      links: [
        { id: "nino", text: "In Nino Studio gedrehte Ausschnitte werden zu Posts." },
        { id: "cairn", text: "Das in Cairn geschriebene Markenprofil leitet die KI." },
        { id: "lamio", text: "Der Post wird in einem Lamio-Kanal freigegeben, bevor er rausgeht." },
      ],
      faq: [
        { q: "Auf welchen Netzwerken postet Metricove?", a: "Instagram, Facebook, X, LinkedIn und YouTube, inklusive Videos und Shorts." },
        { q: "Postet Metricove wirklich von selbst?", a: "Ja: Ein geplanter Post geht zur vorgesehenen Zeit auf den gewählten Konten raus." },
        { q: "Wozu dient das Markenprofil?", a: "Es gibt der KI deinen Ton, deine Worte und deine Farben, für Posts, die nach dir klingen." },
        { q: "Wie kann ich Metricove testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    nino: {
      title: "Videoregie für Podcast und Livestream",
      headline: ["Die Regie", "deines Studios."],
      intro: "Nino Studio produziert deine Podcasts, Gesprächsrunden und Livestreams. Es steuert OBS vom PC, vom iPad oder vom Stream Deck aus, schneidet automatisch auf die Person, die spricht, empfängt Gäste aus der Ferne und bereitet die Aufnahmen für DaVinci Resolve vor.",
      features: [
        { title: "OBS von überall gesteuert", text: "Vom PC, vom iPad oder vom Stream Deck: die Regie dort, wo du bist." },
        { title: "Automatische Regie", text: "Die Kamera folgt der Stimme: Nino schneidet auf die Person, die spricht." },
        { title: "Gäste aus der Ferne", text: "Ein Gast schaltet sich von zu Hause aus dazu." },
        { title: "Live-Übertragung", text: "Geh live, ohne die Regie zu verlassen." },
        { title: "Bereit für DaVinci Resolve", text: "Die Aufnahmen kommen geordnet für den Schnitt an." },
        { title: "Mehrere Kameras", text: "Totale und Nahaufnahmen, mit einem Klick oder automatisch." },
      ],
      uses: [
        { who: "Ein Video-Podcast", text: "Drei Kameras, zwei Mikros, und niemand hinter dem Regiepult." },
        { who: "Eine Gesprächsrunde", text: "Alle sind im Bild, sobald sie das Wort ergreifen." },
        { who: "Ein Livestream", text: "Ein Gast aus der Ferne, und die Übertragung vom iPad aus gestartet." },
      ],
      links: [
        { id: "maya", text: "Nino verbindet sich mit Maya Studio für Produktion und Übertragung." },
        { id: "alfred", text: "Der Gast hat seinen Termin in Alfred gebucht." },
        { id: "metricove", text: "Die Ausschnitte gehen mit Metricove auf Social Media." },
      ],
      faq: [
        { q: "Brauche ich OBS für Nino Studio?", a: "Ja, Nino steuert OBS. Später kommt es auch zu Maya Studio, der Produktions-Engine der Suite." },
        { q: "Wie funktioniert die automatische Regie?", a: "Nino hört die Mikros ab und schneidet auf die Kamera der Person, die spricht." },
        { q: "Ist Nino Studio schon bereit?", a: "Nino ist in der Beta: Es läuft im Studio und wird jede Woche besser. Frag einen Zugang an, um es zu testen." },
        { q: "Wie kann ich Nino Studio testen?", a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
      ],
    },

    maya: {
      title: "Software für Videoproduktion und Streaming",
      headline: ["Der Motor", "deiner Produktion."],
      intro: "Maya Studio stellt deine Szenen zusammen, mischt deine Quellen und sendet live. Der Studiomodus trennt Vorschau und Programm, aufgenommen wird in MP4 und gesendet per RTMP oder SRT. Alles lässt sich fernsteuern, und Nino Studio verbindet sich damit.",
      features: [
        { title: "Szenen und Quellen", text: "Kameras, Bildschirm, Logo und Titel, Szene für Szene zusammengestellt." },
        { title: "Studiomodus", text: "Bereite die nächste Szene in der Vorschau vor und schick sie ins Programm." },
        { title: "Aufnahme in MP4", text: "Jede Sendung aufgezeichnet, bereit zum Schneiden oder Veröffentlichen." },
        { title: "Streaming per RTMP und SRT", text: "Live auf deiner Plattform, mit einem zuverlässigen Stream." },
        { title: "Komplett steuerbar", text: "Alles lässt sich fernsteuern, und Nino Studio verbindet sich damit." },
        { title: "Windows und macOS", text: "Eine Desktop-App für beide Systeme." },
      ],
      uses: [
        { who: "Ein Video-Podcast", text: "Intro, Set, Gast, geteilter Bildschirm und Abspann." },
        { who: "Ein Event", text: "Die Aufzeichnung per SRT gesendet und gleichzeitig aufgenommen." },
        { who: "Eine automatisierte Regie", text: "Nino Studio steuert Maya, ohne dass jemand am Pult sitzt." },
      ],
      links: [
        { id: "nino", text: "Nino Studio steuert Maya und führt Regie für dich." },
        { id: "metricove", text: "Die Ausschnitte der Sendung werden in Metricove eingeplant." },
        { id: "alfred", text: "Gäste buchen ihren Auftritt in Alfred." },
      ],
      faq: [
        { q: "Ersetzt Maya Studio OBS?", a: "Es ist dieselbe Art von Software: Szenen, Quellen, Studiomodus, Aufnahme und Streaming, darauf ausgelegt, von A bis Z gesteuert zu werden." },
        { q: "Wann erscheint Maya Studio?", a: "Maya kommt bald. Hinterlass deine Adresse im Formular, um zum Start benachrichtigt zu werden." },
        { q: "Auf welchen Systemen?", a: "Als Desktop-App für Windows und macOS." },
        { q: "Welche Streaming-Protokolle?", a: "RTMP und SRT, mit Aufnahme in MP4." },
      ],
    },
  },
};

const TRY_IT: Record<Locale, { q: (name: string) => string; a: string }> = {
  fr: { q: (name) => `Comment essayer ${name} ?`, a: "Remplis le formulaire en bas de la page : on te répond avec un accès d'essai." },
  en: { q: (name) => `How can I try ${name}?`, a: "Fill in the form at the bottom of the page: we'll get back to you with a trial account." },
  de: { q: (name) => `Wie kann ich ${name} testen?`, a: "Füll das Formular unten auf der Seite aus: Wir melden uns mit einem Testzugang." },
};

/** The page of an app added in the admin without its own text: written from the catalogue (already in this language). */
export function fallbackPage(p: { name: string; tagline: string; category: string; description: string }, locale: Locale = "fr"): ProductPage {
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
    faq: [{ q: TRY_IT[locale].q(p.name), a: TRY_IT[locale].a }],
    platforms: "Web",
  };
}

/** The page of an app in this language: its own text when it has one, else written from the catalogue. */
export function productPage(p: { id: string; name: string; tagline: string; category: string; description: string }, locale: Locale): ProductPage {
  const text = PAGES[locale][p.id];
  if (!text) return fallbackPage(p, locale);
  const icons = ICONS[p.id] ?? [];
  return { ...text, features: text.features.map((f, i) => ({ ...f, icon: icons[i] ?? ListTodo })), platforms: PLATFORMS[p.id] ?? "Web" };
}

/** The apps that have a page of their own text, for the tests. */
export const PAGE_IDS = Object.keys(PAGES.fr);
export const pageText = (locale: Locale, id: string) => PAGES[locale][id];
