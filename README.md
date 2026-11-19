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

## Carpetas

```
app/          páginas y API
components/   piezas reutilizables de la interfaz
lib/          lógica (reglas de puntos, base de datos, máquina)
supabase/     esquema de la base de datos
referencia/   maqueta aprobada, logo e imagen del producto (solo referencia)
```

## Seguridad y privacidad

- Las claves van en `.env.local` (nunca en el código). La plantilla es `.env.example`.
- Solo guardamos **correo y alias**.
- El QR contiene un token aleatorio, no un número correlativo.
