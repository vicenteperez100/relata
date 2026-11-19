#!/usr/bin/env bash
# Prueba la migración en un Postgres LOCAL y desechable (no toca Supabase).
# Crea una base temporal, aplica stub + migraciones + pruebas y la borra.
#
# Usa las variables estándar de Postgres para conectarse, por ejemplo:
#   PGHOST=localhost PGPORT=5432 PGUSER=postgres scripts/probar-sql.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="relata_prueba_$$"
psql -d postgres -qc "create database $DB"
trap 'psql -d postgres -qc "drop database if exists $DB" >/dev/null' EXIT
run() { psql -d "$DB" -q -v ON_ERROR_STOP=1 -f "$1"; }
run supabase/tests/stub-supabase.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/tests/seguridad.test.sql
echo "✔ Todas las pruebas SQL pasaron"
