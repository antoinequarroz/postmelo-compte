# Brancher un outil sur le compte

Un outil branché n'a plus à connaître de mot de passe : il envoie la personne vers le service de compte,
qui la lui renvoie avec son identité. C'est le standard OpenID Connect.

## 1. Déclarer l'outil côté compte

Dans le `.env` du service de compte, deux lignes par outil, puis redémarrage :

```env
CAIRN_URL=https://cairn.antoinequarroz.ch
CAIRN_CLIENT_SECRET=<openssl rand -base64 32>
```

Les outils connus sont `lamio`, `cairn`, `metricove`, `tickup`, `alfred` et `nino` (liste dans `src/server/tools.ts`).
L'adresse de retour n'est pas un paramètre : c'est toujours `<adresse de l'outil>/api/auth/compte/callback`.

## 2. Configurer l'outil

```env
COMPTE_URL=https://compte.postmelo.ch
COMPTE_CLIENT_ID=cairn
COMPTE_CLIENT_SECRET=<le même secret>
APP_URL=https://cairn.antoinequarroz.ch
```

Sans ces variables, l'outil garde sa connexion actuelle : c'est le retour en arrière.

## 3. Ajouter deux routes à l'outil

Copie [`clients/compte.ts`](../clients/compte.ts) dans l'outil (par exemple `src/server/compte.ts`). Il n'a aucune dépendance.

```ts
// src/app/api/auth/compte/start/route.ts
import { PENDING_COOKIE, PENDING_MAX_AGE, startSignIn } from "@/server/compte";

export async function GET() {
  const { url, cookie } = await startSignIn();
  const res = new Response(null, { status: 302, headers: { Location: url } });
  res.headers.append("Set-Cookie", `${PENDING_COOKIE}=${cookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${PENDING_MAX_AGE}`);
  return res;
}
```

```ts
// src/app/api/auth/compte/callback/route.ts
import { cookies } from "next/headers";
import { finishSignIn, PENDING_COOKIE } from "@/server/compte";

export async function GET(req: Request) {
  try {
    const person = await finishSignIn(req.url, (await cookies()).get(PENDING_COOKIE)?.value);
    // person = { id, name, email, role: "admin" | "member", twoFactor, authTime, idToken, next }
    // Ici : retrouver ou créer le compte local par person.id (ou par e-mail), puis ouvrir la session de l'outil.
  } catch (error) {
    // Retour à la page de connexion de l'outil avec (error as Error).message
  }
}
```

Pense à exclure `/api/auth/compte` du middleware qui protège l'outil, comme pour `api/auth/lamio` aujourd'hui.

[`exemples/outil-demo.ts`](../exemples/outil-demo.ts) montre le tout en 60 lignes.

## Ce que l'outil reçoit

| Champ | Contenu |
| --- | --- |
| `id` | Identifiant stable de la personne, le même dans tous les outils. Pour un compte repris de Lamio, c'est son identifiant Lamio |
| `name`, `email` | Nom affiché et e-mail |
| `role` | `admin` ou `member`, comme dans Lamio |
| `twoFactor` | `true` si le compte est protégé par une double authentification |
| `authTime` | Quand la personne a prouvé son identité pour la dernière fois |

Le service refuse de donner une identité à un outil qui n'est pas ouvert à la personne. L'outil n'a donc pas à vérifier les droits d'accès.

## Le cas de Cairn (coffre de clés)

Cairn doit continuer d'exiger une double authentification :

- si `person.twoFactor` est `true`, le compte l'a déjà exigée : Cairn peut ouvrir ;
- sinon, Cairn demande son propre code, comme aujourd'hui.

Pour une action sensible, `startSignIn({ maxAge: 300 })` oblige à s'être reconnecté dans les cinq dernières minutes.

## Se déconnecter partout

`signOutUrl(person.idToken)` donne l'adresse qui ferme aussi la session du compte. Sans elle, « se déconnecter » ne quitte que l'outil.

## Apps Mac et iOS

Même parcours, dans une fenêtre du navigateur du système (`ASWebAuthenticationSession`), avec une bibliothèque
OpenID Connect comme AppAuth. Il faudra alors déclarer un client « public » (sans secret) : pas encore prévu dans cette version.

## Adresses standard

Tout est annoncé à `COMPTE_URL/api/auth/.well-known/openid-configuration`. L'émetteur (`iss`) est `COMPTE_URL/api/auth`.
