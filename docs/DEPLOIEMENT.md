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
	reverse_proxy compte:3000
}
```

Puis recharge Caddy : `docker exec antoinequarroz-caddy caddy reload --config /etc/caddy/Caddyfile`.

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

## 6. Sauvegarde

Tout tient dans le volume `compte_app-data` (fichier `compte.db`). À ajouter à la sauvegarde nocturne, comme Lamio :

```bash
~/compte/deploy/backup.sh        # écrit dans ~/compte-backups, garde les 14 dernières
```

Chaque nuit à 3h20, avec `crontab -e` :

```cron
20 3 * * * $HOME/compte/deploy/backup.sh >> $HOME/compte-backups.log 2>&1
```

Pour restaurer : arrête le service, décompresse la sauvegarde à la place de `compte.db` dans le volume, relance.
Le fichier `.env` n'est pas dans la sauvegarde : garde une copie de `AUTH_SECRET` à part.

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
