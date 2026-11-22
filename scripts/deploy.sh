#!/usr/bin/env bash
# ==========================================================
# DEPLOY DE TUKI EN EL VPS
# ==========================================================
#
# Uso (desde la carpeta del proyecto en el VPS):
#
#   bash scripts/deploy.sh
#
# Hace, en orden:
#   1. Baja los cambios de GitHub
#   2. Instala dependencias
#   3. Aplica migraciones a la base (solo agrega, no borra)
#   4. Compila
#   5. Reinicia la app en pm2
#
# NO toca productos, precios ni stock: eso se cambia
# desde el admin o con scripts/relanzamiento.ts.
#
# Si el proceso de pm2 no se llama "tuki":
#   APP_NAME=nombre bash scripts/deploy.sh
# ==========================================================

set -euo pipefail

APP_NAME="${APP_NAME:-tuki}"

cd "$(dirname "$0")/.."
CARPETA="$(pwd)"

paso() { echo; echo "==> $1"; }
error() { echo; echo "ERROR: $1"; exit 1; }

# ----------------------------------------------------------
paso "Verificando .env"
# ----------------------------------------------------------

[ -f .env ] || error "No existe .env en $CARPETA"

grep -q '^DATABASE_URL=' .env || error "Falta DATABASE_URL en .env"

if ! grep -qE '^AUTH_SECRET=.{32,}' .env; then
  error "Falta AUTH_SECRET en .env (mínimo 32 caracteres). Generala con:
  node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"
y agregá la línea AUTH_SECRET=... al .env"
fi

if grep -q '^ROULETTE_TEST_MODE=true' .env; then
  echo "AVISO: ROULETTE_TEST_MODE=true -> la ruleta no tiene límite de giros."
fi

echo "OK"

# ----------------------------------------------------------
paso "Bajando cambios de GitHub"
# ----------------------------------------------------------

git pull --ff-only origin main
echo "Versión: $(git log --oneline -1)"

# ----------------------------------------------------------
paso "Instalando dependencias"
# ----------------------------------------------------------

npm ci

# ----------------------------------------------------------
paso "Aplicando migraciones a la base de datos"
# ----------------------------------------------------------

npx prisma migrate deploy
npx prisma generate

# ----------------------------------------------------------
paso "Compilando"
# ----------------------------------------------------------

npm run build

# ----------------------------------------------------------
paso "Reiniciando la app"
# ----------------------------------------------------------

if ! command -v pm2 >/dev/null 2>&1; then
  echo "No encontré pm2. Reiniciá la app a mano."
  exit 0
fi

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  # Avisar si pm2 corre la app desde OTRA carpeta
  CWD_PM2="$(pm2 describe "$APP_NAME" | grep -m1 'exec cwd' | awk -F'│' '{gsub(/ /,"",$3); print $3}')"
  if [ -n "$CWD_PM2" ] && [ "$CWD_PM2" != "$CARPETA" ]; then
    echo "AVISO: pm2 corre '$APP_NAME' desde $CWD_PM2"
    echo "       pero este deploy se hizo en $CARPETA"
    echo "       Los cambios NO se van a ver hasta que coincidan."
  fi

  pm2 restart "$APP_NAME" --update-env
else
  echo "No hay un proceso de pm2 llamado '$APP_NAME'. Procesos actuales:"
  pm2 list
  echo
  echo "Volvé a correr con el nombre correcto:"
  echo "  APP_NAME=nombre bash scripts/deploy.sh"
  echo "o, si nunca se creó:"
  echo "  pm2 start npm --name tuki -- start && pm2 save"
  exit 1
fi

pm2 save >/dev/null

paso "Listo: $(git log --oneline -1)"
