import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacidad" };

/**
 * Política de privacidad del PROTOTIPO, en lenguaje simple.
 * Si el proyecto pasa a producción, debe revisarla alguien con formación legal.
 */
export default function Privacidad() {
  return (
    <article className="legal">
      <p className="eyebrow">Privacidad</p>
      <h1>Cómo cuidamos tus datos</h1>
      <p className="muted">
        ReLata es un prototipo del curso TEI101 (Universidad Adolfo Ibáñez). Aun así, lo diseñamos para guardar
        lo mínimo posible.
      </p>

      <h2>Qué guardamos</h2>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Dato</th>
              <th scope="col">Para qué</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tu correo</td>
              <td>Para que puedas ingresar con un enlace, sin contraseña.</td>
            </tr>
            <tr>
              <td>Tu alias</td>
              <td>Para saludarte en tu cuenta y en la pantalla de la máquina. Puede ser un apodo.</td>
            </tr>
            <tr>
              <td>Un código QR</td>
              <td>Un código aleatorio para que la máquina sepa a quién sumarle los puntos.</td>
            </tr>
            <tr>
              <td>Tus latas</td>
              <td>Por cada lata: si era de la marca auspiciadora o de otra, en qué máquina y cuándo. Con eso calculamos tus puntos y tu nivel.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Qué NO guardamos</h2>
      <ul>
        <li>Tu nombre real, RUT, teléfono ni dirección.</li>
        <li>Tu ubicación ni fotos. La cámara del simulador lee el QR dentro del navegador y la imagen no se envía a ningún lado.</li>
        <li>Contraseñas: no existen.</li>
        <li>Cookies de publicidad ni de analítica. Solo usamos la cookie que mantiene tu sesión abierta.</li>
      </ul>

      <h2>Quién puede ver tus datos</h2>
      <ul>
        <li>
          <b>Tú</b>, en Mi cuenta. La base de datos está configurada para que cada persona solo pueda leer lo suyo.
        </li>
        <li>
          <b>La máquina (o el simulador)</b> muestra tu alias y tus puntos al escanear tu QR.
        </li>
        <li>
          <b>La marca auspiciadora</b> solo recibiría cifras totales (por ejemplo, latas recuperadas por máquina),
          nunca correos ni alias.
        </li>
        <li>
          <b>Los servicios que usamos para funcionar</b>: Supabase (base de datos y envío de correos de ingreso)
          y Vercel (publicación de la página).
        </li>
      </ul>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>Hasta que borres tu cuenta. Al terminar el curso, el equipo puede borrar todos los datos del prototipo.</p>

      <h2>Tus derechos</h2>
      <p>
        Según la ley chilena de protección de datos personales (Ley 19.628, actualizada por la Ley 21.719), puedes
        acceder a tus datos, corregirlos y pedir que se eliminen. En ReLata lo puedes hacer tú mismo:
      </p>
      <ul>
        <li>
          <b>Ver tus datos:</b> todo lo que guardamos aparece en <Link href="/mi-cuenta">Mi cuenta</Link>.
        </li>
        <li>
          <b>Corregir:</b> cambia tu alias cuando quieras.
        </li>
        <li>
          <b>Proteger tu QR:</b> si alguien lo fotografió, regenéralo y el anterior deja de funcionar.
        </li>
        <li>
          <b>Eliminar:</b> “Borrar mi cuenta” elimina para siempre tu correo, alias, QR e historial.
        </li>
      </ul>
      <p className="muted">
        Para cualquier otra consulta, contacta al Grupo 2 del curso TEI101.
      </p>
    </article>
  );
}
