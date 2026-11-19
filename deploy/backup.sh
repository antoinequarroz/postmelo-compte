#!/usr/bin/env bash
# Sauvegarde chiffrée du Compte Postmelo : la base (personnes, mots de passe hachés, clés d'accès,
# accès aux outils, CRM, journal de sécurité) et le fichier .env (AUTH_SECRET, sans lequel les
# doubles authentifications ne se relisent pas).
#
#   ./backup.sh [dossier de destination]
#
# Chaque fichier est chiffré avec age pour les clés publiques de deploy/backup-recipients.txt :
# rien n'est écrit en clair sur le disque du VPS, et seul qui a la clé privée (Antoine, coffre
# Cairn) peut relire une sauvegarde. Si BACKUP_REMOTE est défini (deploy/backup.conf), la
# sauvegarde part aussi hors du VPS avec rclone, puis sa taille est vérifiée là-bas.
# À lancer chaque nuit avec cron (docs/DEPLOIEMENT.md). Relecture : ./restore.sh.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
# Réglages locaux, hors du dépôt : BACKUP_REMOTE, KEEP, CONTAINER, RECIPIENTS.
[ -f "$here/backup.conf" ] && . "$here/backup.conf"
dest="${1:-${BACKUP_DIR:-$HOME/compte-backups}}"
recipients="${RECIPIENTS:-$here/backup-recipients.txt}"
container="${CONTAINER:-compte}"
keep="${KEEP:-14}"
env_file="${ENV_FILE:-$here/../.env}"
stamp="$(date +%Y-%m-%d_%H%M)"

fail() { echo "Sauvegarde impossible : $*" >&2; exit 1; }
command -v age >/dev/null || fail "age n'est pas installé (sudo apt install age)."
grep -qE '^age1[0-9a-z]+' "$recipients" 2>/dev/null || fail "aucune clé publique age dans $recipients (voir docs/DEPLOIEMENT.md)."

mkdir -p "$dest"
chmod 700 "$dest"
umask 077
db_out="$dest/compte-$stamp.db.gz.age"
env_out="$dest/compte-$stamp.env.age"
trap 'rm -f "$db_out.part" "$env_out.part"; docker exec "$container" rm -f /data/compte-backup.db /data/compte-backup.db-wal /data/compte-backup.db-shm >/dev/null 2>&1 || true' EXIT

# Copie cohérente de la base, même pendant que le service écrit, vérifiée avant de partir.
docker exec "$container" node -e '
  const Database = require("better-sqlite3");
  const db = new Database("/data/compte.db", { readonly: true });
  db.backup("/data/compte-backup.db").then(() => {
    db.close();
    // Tout dans un seul fichier (pas de -wal à côté), puis vérifiée.
    const copy = new Database("/data/compte-backup.db");
    copy.pragma("journal_mode = DELETE");
    const check = copy.pragma("integrity_check", { simple: true });
    copy.close();
    if (check !== "ok") { console.error("copie abîmée :", check); process.exit(1); }
  });'
# Compressée puis chiffrée en flux : la copie en clair ne quitte jamais le volume du service.
docker exec "$container" sh -c 'gzip -c /data/compte-backup.db' | age -R "$recipients" -o "$db_out.part"
docker exec "$container" rm -f /data/compte-backup.db /data/compte-backup.db-wal /data/compte-backup.db-shm
[ -s "$db_out.part" ] || fail "l'archive chiffrée est vide."
mv "$db_out.part" "$db_out"

if [ -f "$env_file" ]; then
  age -R "$recipients" -o "$env_out.part" "$env_file"
  mv "$env_out.part" "$env_out"
else
  echo "Attention : $env_file introuvable, le .env n'est pas sauvegardé." >&2
fi

# Hors du VPS : la même archive chiffrée, puis on vérifie qu'elle est bien arrivée entière.
if [ -n "${BACKUP_REMOTE:-}" ]; then
  command -v rclone >/dev/null || fail "BACKUP_REMOTE est défini mais rclone n'est pas installé."
  for f in "$db_out" "$env_out"; do
    [ -f "$f" ] || continue
    rclone copyto "$f" "$BACKUP_REMOTE/$(basename "$f")"
    there="$(rclone size --json "$BACKUP_REMOTE/$(basename "$f")" | sed -n 's/.*"bytes":\([0-9]*\).*/\1/p')"
    [ "$there" = "$(wc -c < "$f" | tr -d ' ')" ] || fail "la copie de $(basename "$f") hors du VPS n'a pas la bonne taille."
  done
  # Là-bas aussi, seules les KEEP dernières restent.
  rclone lsf "$BACKUP_REMOTE" --include 'compte-*.age' | sort -r | tail -n +"$((keep * 2 + 1))" | while read -r old; do rclone deletefile "$BACKUP_REMOTE/$old"; done
fi

# Ici, garde les KEEP dernières.
ls -1t "$dest"/compte-*.db.gz.age 2>/dev/null | tail -n +"$((keep + 1))" | xargs -r rm --
ls -1t "$dest"/compte-*.env.age 2>/dev/null | tail -n +"$((keep + 1))" | xargs -r rm --
# Les anciennes sauvegardes en clair (avant le chiffrement) : à effacer à la main une fois la première restauration testée.
if ls "$dest"/compte-*.db.gz >/dev/null 2>&1; then
  echo "Attention : des sauvegardes en clair restent dans $dest (compte-*.db.gz). Efface-les après un ./restore.sh --check réussi." >&2
fi

trap - EXIT
echo "Sauvegarde chiffrée : $db_out${BACKUP_REMOTE:+ (copiée vers $BACKUP_REMOTE)}"
