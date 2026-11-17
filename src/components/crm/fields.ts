import { ACTIVITY_LABEL, KIND_LABEL, LICENSE_STATUS_LABEL, PLAN_LABEL, PRODUCT_STATUS_LABEL, STAGE_LABEL } from "@/lib/crm-labels";
import type { FieldDef } from "./kit";

type Option = { id: string; name: string };
const opts = (labels: Record<string, string>, only?: string[]) => Object.entries(labels).filter(([v]) => !only || only.includes(v)).map(([value, label]) => ({ value, label }));
const pick = (list: Option[], empty?: string) => [...(empty ? [{ value: "", label: empty }] : []), ...list.map((o) => ({ value: o.id, label: o.name }))];

export const companyFields: FieldDef[] = [
  { key: "name", label: "Nom", required: true },
  { key: "kind", label: "Statut", type: "select", options: opts(KIND_LABEL), half: true },
  { key: "email", label: "E-mail", type: "email", half: true },
  { key: "phone", label: "Téléphone", half: true },
  { key: "website", label: "Site web", half: true, placeholder: "https://" },
  { key: "city", label: "Ville", half: true },
  { key: "country", label: "Pays", half: true, placeholder: "CH", hint: "Code à deux lettres." },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const contactFields: FieldDef[] = [
  { key: "name", label: "Nom", required: true },
  { key: "role", label: "Fonction", half: true },
  { key: "phone", label: "Téléphone", half: true },
  { key: "email", label: "E-mail", type: "email" },
];

export const licenseFields = (products: Option[], companies?: Option[]): FieldDef[] => [
  ...(companies ? [{ key: "company_id", label: "Client", type: "select" as const, options: pick(companies), required: true }] : []),
  { key: "product_id", label: "Produit", type: "select", options: pick(products), required: true, half: true },
  { key: "plan", label: "Formule", type: "select", options: opts(PLAN_LABEL), half: true },
  { key: "seats", label: "Places", type: "int", half: true },
  { key: "price_cents", label: "Prix mensuel (CHF)", type: "money", half: true, hint: "Total pour toutes les places." },
  { key: "status", label: "Statut", type: "select", options: opts(LICENSE_STATUS_LABEL), half: true },
  { key: "start_date", label: "Début", type: "date", half: true },
  { key: "renewal_date", label: "Renouvellement", type: "date", half: true },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const dealFields = (products: Option[], companies?: Option[]): FieldDef[] => [
  { key: "title", label: "Titre", required: true, placeholder: "Ex. : 25 places TickUp" },
  ...(companies ? [{ key: "company_id", label: "Client", type: "select" as const, options: pick(companies), required: true }] : []),
  { key: "product_id", label: "Produit", type: "select", options: pick(products, "Toute la suite"), half: true },
  { key: "stage", label: "Étape", type: "select", options: opts(STAGE_LABEL), half: true },
  { key: "value_cents", label: "Montant (CHF)", type: "money", half: true, hint: "Valeur annuelle estimée." },
  { key: "expected_close", label: "Signature prévue", type: "date", half: true },
];

export const productFields: FieldDef[] = [
  { key: "name", label: "Nom", required: true, half: true },
  { key: "category", label: "Catégorie", half: true, placeholder: "Ex. : Communication" },
  { key: "family", label: "Famille", type: "select", options: [{ value: "equipe", label: "Travailler ensemble" }, { value: "media", label: "Créer et diffuser" }], half: true },
  { key: "color", label: "Couleur", half: true, placeholder: "#6f42e6", hint: "La couleur de l'app, en #RRGGBB. Vide : noir et blanc." },
  { key: "tagline", label: "Accroche", hint: "Une phrase, affichée sur la page d'accueil." },
  { key: "description", label: "Points forts", type: "textarea", hint: "Un point par ligne, affichés avec une coche." },
  { key: "status", label: "Statut", type: "select", options: opts(PRODUCT_STATUS_LABEL), half: true, hint: "« Masqué » le retire de la page d'accueil." },
  { key: "price_cents", label: "Prix affiché (CHF / mois)", type: "money", nullable: true, half: true, hint: "Vide : « Sur demande »." },
  { key: "url", label: "Lien « Découvrir »", type: "url", half: true, placeholder: "https://" },
  { key: "sort", label: "Ordre", type: "int", half: true },
];

export const activityKinds = opts(ACTIVITY_LABEL, ["note", "appel", "email", "rdv"]);
