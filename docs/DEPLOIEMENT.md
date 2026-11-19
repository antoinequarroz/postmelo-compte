# Mettre le service de compte en ligne sur le VPS

À la fin de ce guide : **https://compte.postmelo.ch**, avec les comptes de Lamio repris, et rien de cassé :
tant qu'aucun outil n'est branché dessus, le service tourne à côté du reste sans rien changer.

L'adresse est celle de la suite (`postmelo.ch`), pas celle d'un outil. Elle est faite pour durer : la changer plus tard
oblige à reconfigurer chaque outil et invalide les clés d'accès déjà enregistrées.

## 1. DNS

Un enregistrement **A** `compte` dans la zone `postmelo.ch`, vers l'IP du VPS, chez le registraire du domaine. Pour vérifier : `dig +short compte.postmelo.ch`.

## 2. Installer

```bash
git clone https://github.com/antoinequarroz/postmelo-compte ~/compte
cd ~/compte
cp .env.example .env && chmod 600 .env
nano .env
```

Au minimum :

```env
COMPTE_URL=https://compte.postmelo.ch
AUTH_SECRET=<openssl rand -base64 32>
```

Garde une copie de `AUTH_SECRET` dans Cairn : sans lui, les doubles authentifications et les clés de signature sont perdues.

```bash
cd deploy
docker compose up -d --build
docker ps --filter name=compte     # doit devenir « healthy »
```

Le conteneur tourne sans root, avec un système de fichiers en lecture seule, sans aucun privilège Linux et
avec des limites de mémoire et de CPU (`deploy/docker-compose.yml`). Sur une installation existante, vérifie
que `.env` n'est lisible que par toi : `chmod 600 ~/compte/.env` (`ls -l ~/compte/.env` doit montrer `-rw-------`).

## 3. Brancher Caddy

Garde une copie du Caddyfile (`~/.config/antoinequarroz-vitrine/runtime/Caddyfile`), puis ajoute :

```caddy
compte.postmelo.ch {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		-Server
	}
	reverse_proxy compte:3000 {
		# L'adresse vue par Caddy, et elle seule : ce qu'un client écrit dans cet en-tête est remplacé.
		header_up X-Forwarded-For {remote_host}
	}
}
```

Le service lit l'adresse des personnes dans `X-Forwarded-For` pour les limites d'essais et le journal
de sécurité. La ligne `header_up` garantit que cette adresse est celle que Caddy a vue. N'ajoute pas
`trusted_proxies` dans les options globales de Caddy, sauf si un autre proxy (Cloudflare…) passe un jour
devant : il faudrait alors revoir ce réglage.

Puis recharge Caddy : `docker exec antoinequarroz-caddy caddy reload --config /etc/caddy/Caddyfile`.

## 3 bis. La page d'accueil sur postmelo.ch

Le même service sert la page publique de la suite. Dans `.env` : `SITE_URL=https://postmelo.ch`, puis
`cd ~/compte/deploy && docker compose up -d`. Dans le Caddyfile, à la place de l'ancien bloc `postmelo.ch` :

```caddy
postmelo.ch, www.postmelo.ch {
	encode zstd gzip
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		-Server
	}
	@site path / /_compte/* /_next/* /api/contact /favicon.ico /icon* /apple-icon* /robots.txt /.well-known/security.txt
	handle @site {
		reverse_proxy compte:3000 {
			header_up X-Forwarded-For {remote_host}
		}
	}
	# Connexion, compte et admin vivent sur compte.postmelo.ch (cookies et clés d'accès y sont liés).
	handle {
		redir https://compte.postmelo.ch{uri} 302
	}
}
```

Puis recharge Caddy comme ci-dessus.

## 3 ter. Le paiement avec Stripe

`/tarifs` et `/inscription` vivent sur compte.postmelo.ch (postmelo.ch/tarifs y redirige déjà avec le bloc ci-dessus).
Sans Stripe, une inscription démarre l'essai gratuit sans carte. Pour encaisser :

1. Sur dashboard.stripe.com, commence en **mode test**. Développeurs › Clés API : copie la clé secrète `sk_test_…`.
2. Développeurs › Webhooks › Ajouter un endpoint : `https://compte.postmelo.ch/api/stripe/webhook`, avec les événements
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.paid` et `invoice.payment_failed`. Copie le secret de signature `whsec_…`.
3. Paramètres › Facturation › Portail client : active-le (factures, carte, résiliation, changement de nombre de places).
4. Dans `~/compte/.env` : `STRIPE_SECRET_KEY=…` et `STRIPE_WEBHOOK_SECRET=…`, puis `cd ~/compte/deploy && docker compose up -d`.
5. Admin › Produits : le bandeau Stripe passe au vert. Publie les formules, puis fais un achat avec la carte `4242 4242 4242 4242`.
   Les licences arrivent dans Admin › Licences avec l'étiquette « Stripe ».

Pour passer aux vrais paiements, refais 1 à 4 en mode réel (`sk_live_…` et un nouveau webhook avec son propre secret).

## 4. Reprendre les comptes de Lamio

À faire avant de créer un compte à la main, pour garder les mêmes identifiants que dans Lamio.
La base de Lamio est seulement lue.

Lamio écrit en mode WAL : les données récentes sont dans `app.db-wal`, pas dans `app.db` seul.
Il faut donc copier les trois fichiers ensemble, sinon l'import échoue avec « no such table: users ».

```bash
mkdir -p /tmp/lamio-import
for f in app.db app.db-wal app.db-shm; do
  docker cp lamio:/data/$f /tmp/lamio-import/$f 2>/dev/null || true
done
docker cp /tmp/lamio-import compte:/tmp/lamio-import
docker exec compte node scripts/import-lamio.mjs /tmp/lamio-import/app.db /data
docker exec -u root compte rm -rf /tmp/lamio-import && rm -rf /tmp/lamio-import
```

Ouvre ensuite https://compte.postmelo.ch et connecte-toi avec ton e-mail et ton mot de passe de Lamio.
Active la double authentification et ajoute une clé d'accès.

Si Lamio n'a encore aucun compte, saute cette étape : la page de connexion propose de créer le premier compte, qui sera l'administrateur.

## 5. Brancher les outils, un par un

Voir [BRANCHER-UN-OUTIL.md](BRANCHER-UN-OUTIL.md). L'ordre conseillé : Lamio, puis Cairn, Metricove, TickUp, Alfred.
Après chaque ajout dans `.env` : `cd ~/compte/deploy && docker compose up -d`.

## 6. Sauvegarde chiffrée, hors du VPS

Tout tient dans le volume `compte_app-data` (fichier `compte.db`), plus le fichier `.env` (`AUTH_SECRET`).
`backup.sh` copie les deux chaque nuit, **chiffrés avec age** : rien n'est écrit en clair sur le VPS, et seule
ta clé privée peut les relire. Une copie part ensuite hors du VPS.

### Une fois : la clé

Sur ton Mac (jamais sur le VPS) :

```bash
brew install age
age-keygen -o ~/postmelo-backup-key.txt     # affiche « Public key: age1… »
```

Range `~/postmelo-backup-key.txt` dans le coffre Cairn (et une copie sur papier ou clé USB : sans elle, les
sauvegardes sont illisibles, pour toi aussi). Sur le VPS, colle seulement la clé **publique** :

```bash
sudo apt install age rclone
echo "age1…" > ~/compte/deploy/backup-recipients.txt
```

### Une fois : la copie hors du VPS

Avec Infomaniak Swiss Backup (ou tout stockage que rclone connaît) : `rclone config`, crée un remote nommé
`swissbackup`, puis :

```bash
echo 'BACKUP_REMOTE=swissbackup:compte' > ~/compte/deploy/backup.conf
~/compte/deploy/backup.sh        # écrit dans ~/compte-backups, copie hors du VPS, garde les 14 dernières
```

Le stockage distant ne voit que des fichiers chiffrés. Sans `BACKUP_REMOTE`, la sauvegarde reste sur le VPS
(chiffrée) et le script ne la copie nulle part.

Chaque nuit à 3h20, avec `crontab -e` :

```cron
20 3 * * * $HOME/compte/deploy/backup.sh >> $HOME/compte-backups.log 2>&1
```

Le script s'arrête avec un message clair (et rien n'est écrit) s'il manque la clé publique, si la copie de la
base n'est pas intègre ou si la copie distante n'a pas la bonne taille.

### Chaque mois : relire une sauvegarde

Sur ton Mac, là où est la clé privée (le 1er du mois, par exemple) :

```bash
rclone copy swissbackup:compte ~/compte-restore-test --max-age 2d
./deploy/restore.sh --check ~/compte-restore-test/compte-<date>.db.gz.age ~/postmelo-backup-key.txt
```

Le script déchiffre dans un dossier temporaire, vérifie l'intégrité de la base, compte les personnes et les
admins, vérifie que le `.env` de la même nuit contient `AUTH_SECRET`, puis efface tout. Il ne touche à rien.
Efface ensuite `~/compte-restore-test`.

### Restaurer pour de vrai

Sur le VPS, en apportant la clé privée le temps de l'opération :

```bash
~/compte/deploy/restore.sh --apply ~/compte-backups/compte-<date>.db.gz.age /chemin/vers/la-cle.txt
```

Même vérification, puis le service est arrêté, sa base actuelle mise de côté dans le volume
(`compte.db.avant-restauration-<date>`), la sauvegarde mise à sa place, et le service relancé. Si `AUTH_SECRET`
a changé depuis, reprends le `.env` de la sauvegarde (`age -d -i la-cle.txt compte-<date>.env.age`). Efface la
clé privée du VPS ensuite.

## Mettre à jour

```bash
cd ~/compte && git pull && cd deploy && docker compose up -d --build
```

Les tables manquantes sont créées au démarrage. Les sessions ouvertes restent ouvertes.

## Dépanner

| Symptôme | Cause probable |
| --- | --- |
| Le conteneur redémarre en boucle | `AUTH_SECRET` manque ou fait moins de 32 caractères, ou un `<OUTIL>_CLIENT_SECRET` est trop court (`docker logs compte`) |
| « Connexion impossible » dans un outil | Le secret n'est pas le même des deux côtés, ou `APP_URL` de l'outil ne correspond pas à `<OUTIL>_URL` du compte |
| La clé d'accès n'est plus proposée | `COMPTE_URL` a changé : les clés sont liées au nom de domaine |
| « Trop d'essais » | Cinq connexions par minute au plus par adresse : attendre une minute |
