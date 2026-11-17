#!/usr/bin/env bash
# Sauvegarde du Compte Postmelo : la base (personnes, mots de passe hachés, clés d'accès, accès aux outils).
#   ./backup.sh [dossier de destination]
# À lancer chaque nuit avec cron, puis à copier hors du VPS.
# Le fichier .env (AUTH_SECRET) n'est pas dans la sauvegarde : garde-en une copie à part.
set -euo pipefail

dest="${1:-$HOME/compte-backups}"
stamp="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$dest"
chmod 700 "$dest"

# Copie cohérente de la base, même pendant que le service écrit.
docker exec compte node -e 'const db = require("better-sqlite3")("/data/compte.db", { readonly: true }); db.backup("/data/compte-backup.db").then(() => db.close())'
docker exec compte sh -c 'gzip -c /data/compte-backup.db && rm -f /data/compte-backup.db' > "$dest/compte-$stamp.db.gz"
# Une archive vide ou abîmée ne doit pas passer pour une sauvegarde.
gzip -t "$dest/compte-$stamp.db.gz"
chmod 600 "$dest/compte-$stamp.db.gz"

# Garde les 14 dernières sauvegardes.
ls -1t "$dest"/compte-*.db.gz | tail -n +15 | xargs -r rm --
echo "Sauvegarde : $dest/compte-$stamp.db.gz"
