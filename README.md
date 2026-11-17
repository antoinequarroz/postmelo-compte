# Compte Postmelo

Un seul compte pour tous les outils de la suite Postmelo : Lamio, Cairn, Metricove, TickUp, Alfred, Nino.
Comme un compte Google ou Adobe, mais à toi et hébergé chez toi.

Le nom affiché est défini à un seul endroit, `src/lib/brand.ts`.

## Ce que ça fait

- **La page d'accueil de postmelo.ch** (`/`) : la vitrine de la suite. Les produits, regroupés en « Travailler ensemble »
  et « Créer et diffuser », viennent du catalogue de l'admin. Le formulaire de contact crée un prospect dans le CRM.
- **L'admin** (`/admin`, administrateurs seulement) : le CRM de la suite.
  - Tableau de bord : revenu mensuel et annuel, licences et places, clients et prospects, pipeline pondéré,
    renouvellements des 45 prochains jours, activité récente.
  - Clients : recherche, statut (prospect, client, partenaire, ancien client), fiche avec contacts, licences,
    opportunités et journal (notes, appels, e-mails, rendez-vous, et tout ce qui a changé). Export CSV.
  - Licences : par client et par produit, formule, places, prix mensuel, statut, date de renouvellement. Export CSV.
  - Pipeline : les opportunités en colonnes, à glisser d'une étape à l'autre. Gagner fait passer le prospect en client.
  - Produits : le catalogue (nom, couleur, accroche, points forts, statut, prix affiché). « Masqué » le retire de la page d'accueil.

- **Connexion** par e-mail et mot de passe, ou par clé d'accès (Face ID, Touch ID, clé de sécurité).
- **Double authentification** par application (code à six chiffres), avec codes de secours.
- **Mon compte** : nom, mot de passe, clés d'accès, appareils connectés avec déconnexion à distance.
- **Personnes et accès** (admins) : créer les comptes, choisir les outils ouverts à chacun.
- **OpenID Connect** : chaque outil s'y branche avec le standard qu'utilisent Google et Microsoft
  (code d'autorisation + PKCE, jetons signés, déconnexion). Voir [docs/BRANCHER-UN-OUTIL.md](docs/BRANCHER-UN-OUTIL.md).
- **Reprise des comptes de Lamio**, avec les mêmes identifiants et les mêmes mots de passe.

Pas d'inscription libre : le premier compte créé est l'administrateur, qui ajoute les autres.

## Sur quoi ça repose

Même socle que le reste de la suite : Next.js 15, React 19, Tailwind 4, SQLite (better-sqlite3), pnpm, Docker.
La partie sensible n'est pas écrite ici : elle vient de [Better Auth](https://www.better-auth.com)
(sessions, mots de passe, double authentification, clés d'accès) et de son module `oauth-provider`
(OpenID Connect). Ce dépôt ajoute les pages, les droits d'accès par outil et la reprise depuis Lamio.

| Où | Quoi |
| --- | --- |
| `src/server/auth.ts` | Toute la configuration : sessions, limites, OpenID Connect, règles d'accès |
| `src/server/tools.ts` | La liste des outils, lue dans les variables d'environnement |
| `src/server/db.ts` | La base SQLite et la table « qui a accès à quel outil » |
| `src/app/connexion` | La page de connexion (mot de passe, code, clé d'accès, premier compte) |
| `src/components/account.tsx`, `admin.tsx` | La page « Mon compte » (`/compte`) et la gestion des personnes |
| `src/app/page.tsx` | La page d'accueil publique de la suite |
| `src/server/crm.ts` | Le CRM : tables, règles, catalogue de départ, tableau de bord, export CSV |
| `src/app/admin`, `src/components/crm` | Les pages de l'admin |
| `src/app/api/crm`, `src/app/api/contact` | L'API de l'admin et le formulaire de contact |
| `clients/compte.ts` | Le fichier à copier dans un outil pour le brancher |
| `exemples/outil-demo.ts` | Un outil minuscule qui se connecte avec le compte |
| `scripts/import-lamio.mjs` | La reprise des comptes de Lamio |

## Lancer en local

```bash
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:3000
```

Pour essayer la connexion d'un outil, donne `CAIRN_URL=http://localhost:4000` et un `CAIRN_CLIENT_SECRET`
dans `.env`, puis lance l'outil de démonstration avec le même secret :

```bash
COMPTE_URL=http://localhost:3000 COMPTE_CLIENT_ID=cairn COMPTE_CLIENT_SECRET=… APP_URL=http://localhost:4000 \
  node --experimental-strip-types exemples/outil-demo.ts
```

## Vérifier

```bash
pnpm lint && pnpm test && pnpm build
```

Les tests rejouent le parcours complet d'un outil avec `openid-client`, la bibliothèque cliente de référence :
connexion, échange du code, vérification du jeton, profil, renouvellement, refus d'accès, comptes repris de Lamio.

## Mettre en ligne

Voir [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md).

## Pas encore là

- E-mails (mot de passe oublié, vérification d'adresse) : pour l'instant, un admin remplace le mot de passe.
- Journal des connexions et alerte en cas de nouvel appareil.
- Connexion via Google ou Microsoft, espaces par client (pour la vente).
