#!/usr/bin/env bash
# Relire une sauvegarde chiffrée du Compte Postmelo.
#
#   ./restore.sh --check <sauvegarde> <clé privée age>
#       Déchiffre dans un dossier temporaire, vérifie la base (intégrité, comptes, journal) et le
#       .env qui l'accompagne, puis efface tout. Ne touche pas au service. À faire chaque mois,
#       là où se trouve la clé privée (le Mac d'Antoine) : c'est la preuve que les sauvegardes
#       servent à quelque chose.
#
#   ./restore.sh --apply <sauvegarde> <clé privée age>
#       Même vérification, puis remplace la base du service par celle de la sauvegarde. La base
#       actuelle est gardée à côté (compte.db.avant-restauration-<date>). Demande confirmation.
#
# <sauvegarde> : un fichier compte-AAAA-MM-JJ_HHMM.db.gz.age, ou un chemin rclone
# (swissbackup:compte/compte-….db.gz.age) d'où il est d'abord téléchargé.
set -euo pipefail

mode="${1:-}"
archive="${2:-}"
identity="${3:-}"
container="${CONTAINER:-compte}"
usage() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }
fail() { echo "Restauration impossible : $*" >&2; exit 1; }
[ "$mode" = "--check" ] || [ "$mode" = "--apply" ] || usage
[ -n "$archive" ] && [ -n "$identity" ] || usage
[ -f "$identity" ] || fail "clé privée introuvable : $identity"
command -v age >/dev/null || fail "age n'est pas installé (brew install age, ou sudo apt install age)."

# Tout ce qui est en clair vit ici, lisible par toi seul, et disparaît à la fin quoi qu'il arrive.
work="$(mktemp -d)"
chmod 700 "$work"
trap 'rm -rf "$work"' EXIT
umask 077

fetch() { # <source> <destination>
  if [ -f "$1" ]; then cp "$1" "$2"
  elif [[ "$1" == *:* ]] && command -v rclone >/dev/null; then rclone copyto "$1" "$2"
  else return 1; fi
}

fetch "$archive" "$work/db.gz.age" || fail "sauvegarde introuvable : $archive"
age -d -i "$identity" -o "$work/db.gz" "$work/db.gz.age" || fail "déchiffrement refusé (mauvaise clé ou fichier abîmé)."
gzip -t "$work/db.gz" || fail "l'archive déchiffrée est abîmée."
gunzip "$work/db.gz"

# La base est relue avec sqlite3 s'il est là (macOS l'a), sinon avec l'image du service.
inspect() {
  local sql="select 'integrite', (select integrity_check from pragma_integrity_check) union all
    select 'comptes', count(*) from \"user\" union all
    select 'admins', count(*) from \"user\" where role = 'admin' union all
    select 'journal', count(*) from audit_log;"
  if command -v sqlite3 >/dev/null; then
    sqlite3 -readonly -separator ' ' "$work/db" "$sql"
  else
    local image="${IMAGE:-$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null || true)}"
    [ -n "$image" ] || fail "ni sqlite3 ni l'image du service pour relire la base (IMAGE=… pour la donner)."
    docker run --rm --network none --read-only --cap-drop ALL --user "$(id -u):$(id -g)" -v "$work:/restore:ro" --entrypoint node "$image" -e '
      const db = new (require("better-sqlite3"))("/restore/db", { readonly: true });
      const one = (sql) => Object.values(db.prepare(sql).get())[0];
      console.log("integrite", db.pragma("integrity_check", { simple: true }));
      console.log("comptes", one("select count(*) from \"user\""));
      console.log("admins", one("select count(*) from \"user\" where role = '"'"'admin'"'"'"));
      console.log("journal", one("select count(*) from audit_log"));'
  fi
}

report="$(inspect)" || fail "la base déchiffrée ne s'ouvre pas."
echo "$report" | sed 's/^/  /'
echo "$report" | grep -qx 'integrite ok' || fail "la base n'est pas intègre."
echo "$report" | grep -qE '^admins [1-9]' || fail "aucun compte admin dans cette sauvegarde."

# Le .env de la même nuit : il doit contenir AUTH_SECRET (sa valeur n'est jamais affichée).
env_archive="${archive%.db.gz.age}.env.age"
if fetch "$env_archive" "$work/env.age" 2>/dev/null; then
  age -d -i "$identity" -o "$work/env" "$work/env.age" || fail "le .env ne se déchiffre pas."
  grep -qE '^AUTH_SECRET=.{32,}' "$work/env" || fail "le .env de cette sauvegarde n'a pas d'AUTH_SECRET valable."
  echo "  .env avec AUTH_SECRET : ok"
else
  echo "  Attention : pas de .env sauvegardé avec cette base ($env_archive)." >&2
fi

if [ "$mode" = "--check" ]; then
  echo "Sauvegarde relue avec succès : $archive"
  exit 0
fi

# --apply : remplace la base du service, en gardant l'actuelle à côté.
image="${IMAGE:-$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null || true)}"
[ -n "$image" ] || fail "le conteneur $container est introuvable."
read -r -p "Remplacer la base de $container par cette sauvegarde ? Tape RESTAURER pour continuer : " answer
[ "$answer" = "RESTAURER" ] || fail "annulé."
stamp="$(date +%Y-%m-%d_%H%M%S)-$$"
docker stop "$container" >/dev/null
# Quoi qu'il arrive ensuite, le service redémarre (avec l'ancienne base si la copie a échoué).
trap 'docker start "$container" >/dev/null 2>&1 || true; rm -rf "$work"' EXIT
# La base passe par l'entrée standard : le dossier temporaire reste lisible par toi seul.
docker run --rm -i --network none --cap-drop ALL --user 1001:1001 --volumes-from "$container" --entrypoint sh "$image" -c "
  set -e
  for f in compte.db compte.db-wal compte.db-shm; do
    if [ -f /data/\$f ]; then
      [ ! -e /data/\$f.avant-restauration-$stamp ] || exit 1
      cp /data/\$f /data/\$f.avant-restauration-$stamp
    fi
  done
  [ ! -f /data/compte.db ] || [ -s /data/compte.db.avant-restauration-$stamp ]
  cat > /data/compte.db.new
  [ -s /data/compte.db.new ]
  rm -f /data/compte.db-wal /data/compte.db-shm
  mv /data/compte.db.new /data/compte.db" < "$work/db"
docker start "$container" >/dev/null
trap 'rm -rf "$work"' EXIT
# Le service doit redevenir sain : sinon, on le dit, avec le chemin du retour en arrière.
status=""
for _ in $(seq 1 60); do
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}sans-healthcheck{{end}}' "$container" 2>/dev/null || true)"
  [ "$status" = "healthy" ] || [ "$status" = "unhealthy" ] && break
  if [ "$status" = "sans-healthcheck" ]; then
    [ "$(docker inspect --format '{{.State.Running}}' "$container" 2>/dev/null)" = "true" ] && status="healthy"
    break
  fi
  sleep 2
done
if [ "$status" != "healthy" ]; then
  docker logs --tail 30 "$container" >&2 || true
  echo "Le service ne redevient pas sain après la restauration (état : ${status:-inconnu})." >&2
  echo "Retour en arrière : docker stop $container, puis dans le volume remplace compte.db par compte.db.avant-restauration-$stamp (et ses -wal/-shm), puis docker start $container." >&2
  exit 1
fi
echo "Base restaurée depuis $archive. L'ancienne est dans le volume : compte.db.avant-restauration-$stamp"
echo "Si le .env a changé depuis, reprends-le de la sauvegarde avant de continuer (AUTH_SECRET)."
