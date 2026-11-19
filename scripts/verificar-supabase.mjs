// Verifica que tu proyecto de Supabase esté bien configurado.
// Uso: npm run db:verificar   (lee las claves desde .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publica = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secreta = process.env.SUPABASE_SECRET_KEY;

let fallos = 0;
const ok = (msg) => console.log(`  ✔ ${msg}`);
const mal = (msg) => { fallos++; console.log(`  ✘ ${msg}`); };

console.log("\nVerificando Supabase…\n");
if (!url || !publica || !secreta) {
  console.log("  ✘ Faltan variables en .env.local (URL, publishable key o secret key).");
  process.exit(1);
}

const admin = createClient(url, secreta, { auth: { persistSession: false } });
const anonimo = createClient(url, publica, { auth: { persistSession: false } });

// 1. Las tablas existen (con la clave secreta)
for (const tabla of ["profiles", "can_events", "conteo_latas"]) {
  const { error } = await admin.from(tabla).select("*", { count: "exact", head: true });
  if (error) mal(`No encuentro "${tabla}": ${error.message}. ¿Corriste el SQL de supabase/migrations?`);
  else ok(`Existe "${tabla}"`);
}

// 2. registrar_lata existe y no registra tokens falsos
{
  const { data, error } = await admin.rpc("registrar_lata", { p_token: "token-que-no-existe", p_tipo: "otra", p_maquina_id: "VERIFICACION" });
  if (error) mal(`registrar_lata falló: ${error.message}`);
  else if (data.length !== 0) mal("registrar_lata aceptó un token falso");
  else ok("registrar_lata existe y rechaza tokens falsos");
}

// 3. Sin sesión no se ve nada (RLS + permisos)
for (const tabla of ["profiles", "can_events"]) {
  const { data, error } = await anonimo.from(tabla).select("*").limit(1);
  if (error || (data && data.length === 0)) ok(`Sin sesión no se puede leer "${tabla}"`);
  else mal(`¡Cuidado! Sin sesión se puede leer "${tabla}". Revisa el RLS.`);
}

// 4. Sin sesión no se pueden registrar latas
{
  const { error } = await anonimo.rpc("registrar_lata", { p_token: "x", p_tipo: "otra", p_maquina_id: "X" });
  if (error) ok("Sin sesión no se puede llamar a registrar_lata");
  else mal("¡Cuidado! Cualquiera puede llamar a registrar_lata.");
}

console.log(fallos ? `\n${fallos} problema(s) encontrado(s).\n` : "\nTodo bien: Supabase está listo.\n");
process.exit(fallos ? 1 : 0);
