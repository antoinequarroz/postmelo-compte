import { ACTIVITY_LABEL, FIGURE_SOURCE_LABEL, PROOF_STATUS_LABEL, KIND_LABEL, LICENSE_STATUS_LABEL, PLAN_LABEL, PLAN_SCOPE_LABEL, PLAN_STATUS_LABEL, PRODUCT_STATUS_LABEL, STAGE_LABEL } from "@/lib/crm-labels";
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
  { key: "price_cents", label: "Prix (CHF / personne / mois)", type: "money", nullable: true, half: true, hint: "Prix de l'app dans la formule « Une app ». Vide : le prix de la formule." },
  { key: "url", label: "Lien « Découvrir »", type: "url", half: true, placeholder: "https://" },
  { key: "sort", label: "Ordre", type: "int", half: true },
];

export const planFields: FieldDef[] = [
  { key: "name", label: "Nom", required: true, half: true },
  { key: "scope", label: "Contenu", type: "select", options: opts(PLAN_SCOPE_LABEL), half: true },
  { key: "tagline", label: "Accroche", hint: "Une phrase sous le nom, sur /tarifs." },
  { key: "features", label: "Ce qui est inclus", type: "textarea", hint: "Un point par ligne, affichés avec une coche." },
  { key: "monthly_cents", label: "Prix (CHF / personne / mois)", type: "money", nullable: true, half: true, hint: "Vide : « Sur devis » (bouton Nous écrire)." },
  { key: "yearly_discount", label: "Remise à l'année (%)", type: "int", half: true, hint: "0 : même prix au mois et à l'année." },
  { key: "trial_days", label: "Essai gratuit (jours)", type: "int", half: true, hint: "0 : pas d'essai, paiement tout de suite." },
  { key: "highlight", label: "Mise en avant", type: "select", options: [{ value: "0", label: "Non" }, { value: "1", label: "Oui, « Le plus choisi »" }], half: true },
  { key: "status", label: "Statut", type: "select", options: opts(PLAN_STATUS_LABEL), half: true, hint: "Seules les formules publiées sont visibles et achetables." },
  { key: "sort", label: "Ordre", type: "int", half: true },
];

export const activityKinds = opts(ACTIVITY_LABEL, ["note", "appel", "email", "rdv"]);

// ---- Social proof

const proofStatus = { key: "status", label: "Sur le site", type: "select" as const, options: opts(PROOF_STATUS_LABEL), half: true, hint: "Un brouillon reste ici." };
const sortField = { key: "sort", label: "Ordre", type: "int" as const, half: true, hint: "Du plus petit au plus grand." };

export const testimonialFields = (products: Option[], companies: Option[]): FieldDef[] => [
  { key: "quote", label: "Citation", type: "textarea", required: true, hint: "Les mots exacts de la personne, publiés avec son accord." },
  { key: "author", label: "Nom", required: true, half: true },
  { key: "role", label: "Fonction", half: true, placeholder: "Directrice, Atelier Rhône" },
  { key: "company_id", label: "Client du CRM", type: "select", options: pick(companies, "Aucun"), half: true },
  { key: "company", label: "Entreprise affichée", half: true, hint: "Vide : le nom du client du CRM." },
  { key: "product_id", label: "Application", type: "select", options: pick(products, "Toute la suite"), half: true },
  proofStatus,
  sortField,
];

export const logoFields = (companies: Option[]): FieldDef[] => [
  { key: "name", label: "Nom", required: true, half: true, hint: "Affiché en toutes lettres s'il n'y a pas d'image." },
  { key: "company_id", label: "Client du CRM", type: "select", options: pick(companies, "Aucun"), half: true },
  { key: "image", label: "Logo", type: "image", hint: "SVG ou PNG transparent, 300 Ko au plus. Il s'affiche en monochrome, en couleur au survol." },
  { key: "link", label: "Lien", type: "url", placeholder: "https://", half: true },
  proofStatus,
  sortField,
];

export const figureFields: FieldDef[] = [
  { key: "label", label: "Libellé", required: true, placeholder: "équipes utilisent la suite" },
  { key: "source", label: "Source", type: "select", options: opts(FIGURE_SOURCE_LABEL), hint: "Compté dans le CRM : le chiffre suit tout seul, et se cache tant qu'il vaut zéro." },
  { key: "value", label: "Chiffre", half: true, placeholder: "1200", hint: "Seulement pour « Saisi à la main »." },
  { key: "suffix", label: "Après le chiffre", half: true, placeholder: "+ ou %" },
  proofStatus,
  sortField,
];
