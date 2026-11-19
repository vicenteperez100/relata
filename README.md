# ReLata

Compactadora inteligente de latas con incentivos. Prototipo del curso TEI101,
Universidad Adolfo Ibáñez, Grupo 2.

## Qué hace

- La persona se identifica con un **QR** desde *Mi cuenta*.
- La máquina lee el código de barras de la lata, la aplasta y registra **puntos**.
- **Reglas:** lata de otra marca = 1 punto · lata de la marca auspiciadora = 1,5 puntos.
- **Niveles:** 1 Lata (0) · 2 Lámina (25) · 3 Bloque (75) · 4 Lingote (150) · 5 Infinito (300).
- **Una lata gratis cada 20 puntos.**

## Stack

- [Next.js](https://nextjs.org) (páginas y API en un mismo proyecto)
- [Supabase](https://supabase.com) (base de datos y login por correo)
- [Vercel](https://vercel.com) (publicación)
- [Vitest](https://vitest.dev) (tests)

## Cómo correrlo en tu computador

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install                 # instala dependencias (solo la primera vez)
cp .env.example .env.local  # crea tu archivo de claves y complétalo
npm run dev                 # abre http://localhost:3000
npm test                    # corre los tests
```

## Configurar Supabase (una sola vez)

1. Crea un proyecto en [supabase.com](https://supabase.com) (región São Paulo).
2. **SQL Editor → New query**: pega todo `supabase/migrations/0001_inicial.sql` y aprieta **Run**.
3. **Project Settings → API Keys**: copia la *URL*, la *publishable key* y la *secret key*
   en tu `.env.local` (nunca en el código ni en el chat).
4. Verifica: `npm run db:verificar`. Debe terminar en "Todo bien".
5. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (cuando publiquemos, la URL de Vercel).
   - *Redirect URLs*: agrega `http://localhost:3000/**`.
6. **Authentication → Emails** (plantillas). En **Magic Link** y en **Confirm signup**,
   cambia el enlace del cuerpo por este, para que funcione aunque abras el correo en
   otro dispositivo:
   ```html
   <h2>Entra a ReLata</h2>
   <p>Haz clic para ingresar. El enlace vence en una hora.</p>
   <p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Ingresar a ReLata</a></p>
   <p>Si no pediste este correo, ignóralo.</p>
   ```

> El plan gratis de Supabase envía pocos correos por hora (suficiente para la demo).
> Para más, configura un SMTP propio en *Authentication → Emails → SMTP Settings*.

### Base de datos

| Tabla | Qué guarda |
|---|---|
| `auth.users` | correo (lo gestiona Supabase Auth) |
| `profiles` | alias opcional y token del QR |
| `can_events` | cada lata: persona, tipo, máquina y fecha |
| `conteo_latas` (vista) | latas por tipo de cada persona |

Los **puntos no se guardan**: se calculan con `lib/reglas/puntos.ts` a partir del conteo.
Con RLS, cada persona solo lee lo suyo; las latas solo se registran desde el servidor.

`npm run test:sql` prueba el esquema en un Postgres local desechable
(necesita Postgres instalado; usa las variables `PGHOST`, `PGPORT`, `PGUSER`).

## API de la máquina

La máquina registra cada lata con una petición `POST /api/maquina/latas`,
protegida con la clave `MACHINE_API_KEY` (va en `.env.local`, nunca en el código).

```bash
curl -X POST http://localhost:3000/api/maquina/latas \
  -H "Authorization: Bearer $MACHINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"token":"relata:<token del QR>","tipo":"auspiciadora","maquinaId":"RLT-01"}'
```

| Campo | Valor |
|---|---|
| `token` | Lo que leyó el lector de QR (`relata:...` o solo el token) |
| `tipo` | `"auspiciadora"` o `"otra"` (según el código de barras de la lata) |
| `maquinaId` | Identificador de la máquina: letras, números, `-` o `_` (máx. 40) |

| Respuesta | Significado |
|---|---|
| `201` | Lata registrada. Devuelve puntos, nivel, `subioDeNivel` y `ganoLataGratis` para la pantalla |
| `400` | Datos inválidos o el QR no es de ReLata |
| `401` | Falta la clave o es incorrecta |
| `404` | QR con buen formato pero no corresponde a ninguna cuenta |
| `413` / `415` | Cuerpo muy grande o no es JSON |
| `500` | Error interno (el detalle queda solo en los registros del servidor) |

La lógica está en `lib/maquina/` y tiene tests (`npm test`).

## Simulador (demo)

`/simulador` imita la máquina para presentaciones: lee el QR con la cámara del
computador (o "Usar mi propio QR" si hay un solo dispositivo) y registra latas
con los botones "Lata auspiciadora" / "Lata de otra marca".

- Solo pueden entrar los correos de `OPERATOR_EMAILS` (en `.env.local`).
- Las latas se guardan de verdad, marcadas como máquina `SIM-01`.
- La clave secreta nunca llega al navegador: el registro ocurre en el servidor.
- La cámara funciona en `http://localhost` y en sitios `https://` (no en una IP de la red local).

## Carpetas

```
app/          páginas y API
components/   piezas reutilizables de la interfaz
lib/          lógica (reglas de puntos, base de datos, máquina)
supabase/     esquema de la base de datos y sus pruebas
scripts/      verificación de Supabase y pruebas SQL
referencia/   maqueta aprobada, logo e imagen del producto (solo referencia)
```

## Seguridad y privacidad

- Las claves van en `.env.local` (nunca en el código). La plantilla es `.env.example`.
- Solo guardamos **correo y alias**.
- El QR contiene un token aleatorio, no un número correlativo.
