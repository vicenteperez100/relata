"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import s from "./simulador.module.css";

/**
 * Usa la cámara para leer un QR. Cada cuadro de video se dibuja en un canvas
 * oculto y jsQR busca un código en la imagen. Al encontrarlo, apaga la cámara.
 * Nada de la imagen sale del navegador.
 */
export function LectorQr({ onLeido, onCancelar }: { onLeido: (texto: string) => void; onCancelar: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Guardamos la función en una ref para no reiniciar la cámara si cambia.
  const onLeidoRef = useRef(onLeido);
  useEffect(() => {
    onLeidoRef.current = onLeido;
  }, [onLeido]);

  useEffect(() => {
    let activo = true;
    let stream: MediaStream | undefined;
    let raf = 0;

    const apagar = () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Este navegador no permite usar la cámara aquí. Usa “Escribir o pegar el código”.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      } catch (e) {
        const nombre = e instanceof DOMException ? e.name : "";
        setError(
          nombre === "NotAllowedError"
            ? "No diste permiso para usar la cámara. Actívalo en el candado de la barra de direcciones y vuelve a intentar."
            : "No encontramos una cámara disponible. Usa “Escribir o pegar el código”.",
        );
        return;
      }
      if (!activo) return apagar();

      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      video.srcObject = stream;
      await video.play().catch(() => {});

      const revisarCuadro = () => {
        if (!activo) return;
        if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth) {
          // Imagen reducida a 640 px de ancho: suficiente para leer el QR y mucho más rápido.
          const escala = Math.min(1, 640 / video.videoWidth);
          const w = Math.round(video.videoWidth * escala);
          const h = Math.round(video.videoHeight * escala);
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const codigo = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
          if (codigo?.data) {
            activo = false;
            apagar();
            onLeidoRef.current(codigo.data);
            return;
          }
        }
        raf = requestAnimationFrame(revisarCuadro);
      };
      raf = requestAnimationFrame(revisarCuadro);
    })();

    return () => {
      activo = false;
      apagar();
    };
  }, []);

  return (
    <div className={s.lector}>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <div className={s.video}>
          <video ref={videoRef} muted playsInline aria-label="Vista de la cámara" />
          <span className={s.mira} aria-hidden="true" />
          <p className={s.videoHint} role="status">
            Acerca el QR de Mi cuenta a la cámara…
          </p>
        </div>
      )}
      <canvas ref={canvasRef} hidden />
      <button className="btn ghost small" type="button" onClick={onCancelar}>
        Cancelar
      </button>
    </div>
  );
}
