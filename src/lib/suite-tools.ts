/**
 * The tools of the suite that sign people in with this account (no secrets here: this list is
 * also read by the middleware, which builds the Content-Security-Policy). See src/server/tools.ts.
 */
export const SUITE = [
  { id: "lamio", name: "Lamio", description: "Messagerie d'équipe" },
  { id: "cairn", name: "Cairn", description: "Notes et coffre de clés" },
  { id: "metricove", name: "Metricove", description: "Publication et statistiques" },
  { id: "tickup", name: "TickUp", description: "Gestion de projet" },
  { id: "alfred", name: "Alfred", description: "Assistant" },
  { id: "nino", name: "Nino", description: "Régie vidéo" },
  { id: "orbi", name: "Orbi", description: "Erreurs et disponibilité" },
] as const;
