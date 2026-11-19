import QRCode from "qrcode";
import { contenidoQr } from "@/lib/qr";
import { formatearMes } from "@/lib/cuenta/vista";
import s from "./cuenta.module.css";

function iniciales(alias: string): string {
  return alias
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Tarjeta con el QR personal. El QR se genera en el servidor como SVG. */
export async function TarjetaQr({ alias, token, desde }: { alias: string; token: string; desde: string }) {
  const svg = await QRCode.toString(contenidoQr(token), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2, // borde blanco: los lectores lo necesitan
    color: { dark: "#0F2F2A", light: "#FFFFFF" },
  });

  return (
    <aside className={`card ${s.qrCard}`} aria-labelledby="titulo-qr">
      <div className={s.who}>
        <div className={s.avatar} aria-hidden="true">
          {iniciales(alias)}
        </div>
        <div>
          <b>{alias}</b>
          <span>Desde {formatearMes(desde)}</span>
        </div>
      </div>
      <p className="label" id="titulo-qr">
        Tu código de identificación
      </p>
      {/* svg generado por la librería qrcode a partir de un token base64url: no contiene texto del usuario */}
      <div className={s.qrBox} role="img" aria-label="Tu código QR personal de ReLata" dangerouslySetInnerHTML={{ __html: svg }} />
      <p className={s.hint}>
        Muestra este código al lector de la máquina antes de insertar tus latas. Es personal: no lo compartas.
      </p>
    </aside>
  );
}
