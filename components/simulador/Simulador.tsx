"use client";

import { useCallback, useState, useTransition } from "react";
import { identificarPersona, registrarDesdeSimulador } from "@/app/simulador/acciones";
import { Maquina } from "@/components/inicio/Maquina";
import type { LataRegistrada } from "@/lib/maquina/registrar-lata";
import { PUNTOS_POR_LATA, type TipoLata } from "@/lib/reglas/puntos";
import { LectorQr } from "./LectorQr";
import s from "./simulador.module.css";

const pts = (n: number) => n.toLocaleString("es-CL", { maximumFractionDigits: 1 });
/** La pantalla de la máquina tiene espacio para ~20 caracteres por línea. */
const corto = (t: string, max = 20) => (t.length > max ? t.slice(0, max - 1) + "…" : t);

type Fase = "inicio" | "camara" | "identificado";

export function Simulador({ miQr }: { miQr: string }) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [leido, setLeido] = useState("");
  const [alias, setAlias] = useState("");
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pantalla, setPantalla] = useState<[string, string]>(["ESCANEA TU QR", "para empezar"]);
  const [disparo, setDisparo] = useState(0);
  const [ultimo, setUltimo] = useState<LataRegistrada | null>(null);
  const [sesion, setSesion] = useState<{ tipo: TipoLata; puntos: number }[]>([]);
  const [ocupado, iniciar] = useTransition();

  const identificar = useCallback((texto: string) => {
    setError(null);
    iniciar(async () => {
      const r = await identificarPersona(texto);
      if (!r.ok) {
        setFase("inicio");
        setError(r.mensaje);
        setPantalla(["QR NO RECONOCIDO", "Intenta de nuevo"]);
        return;
      }
      setLeido(texto);
      setAlias(r.alias);
      setFase("identificado");
      setUltimo(null);
      setSesion([]);
      setPantalla([`HOLA, ${corto(r.alias.toUpperCase(), 14)}`, "Inserta tu lata"]);
    });
  }, []);

  function insertar(tipo: TipoLata) {
    setError(null);
    iniciar(async () => {
      const r = await registrarDesdeSimulador(leido, tipo);
      if (!r.ok) {
        setError(r.mensaje);
        setPantalla(["ERROR", "Lata no registrada"]);
        return;
      }
      setUltimo(r);
      setSesion((prev) => [{ tipo, puntos: r.puntosGanados }, ...prev]);
      const linea1 = r.ganoLataGratis
        ? "¡LATA GRATIS!"
        : r.subioDeNivel
          ? corto(`¡NIVEL ${r.nivel.numero}: ${r.nivel.nombre.toUpperCase()}!`)
          : "¡LATA ACEPTADA!";
      setPantalla([linea1, `+${pts(r.puntosGanados)} · total ${pts(r.puntos)}`]);
      setDisparo((d) => d + 1); // reinicia la animación de aplastado
    });
  }

  function terminar() {
    setFase("inicio");
    setLeido("");
    setAlias("");
    setUltimo(null);
    setSesion([]);
    setError(null);
    setPantalla(["ESCANEA TU QR", "para empezar"]);
  }

  return (
    <div className={s.layout}>
      <div className={s.maquina}>
        <Maquina pantalla={pantalla} disparo={disparo} />
      </div>

      <div className={s.panel}>
        {/* Paso 1: identificar */}
        {fase !== "identificado" && (
          <section className="card" aria-labelledby="paso-1">
            <p className={s.paso}>PASO 1</p>
            <h2 id="paso-1" className={s.titulo}>
              Identificar a la persona
            </h2>
            {fase === "camara" ? (
              <LectorQr
                onLeido={(texto) => {
                  setFase("inicio");
                  identificar(texto);
                }}
                onCancelar={() => setFase("inicio")}
              />
            ) : (
              <div className={s.acciones}>
                <button className="btn primary" type="button" onClick={() => setFase("camara")} disabled={ocupado}>
                  Escanear QR con la cámara
                </button>
                <button className="btn ghost" type="button" onClick={() => identificar(miQr)} disabled={ocupado}>
                  Usar mi propio QR
                </button>
              </div>
            )}
            {fase === "inicio" && (
              <details className={s.manual}>
                <summary>Escribir o pegar el código</summary>
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    identificar(manual);
                  }}
                >
                  <div className="field">
                    <label htmlFor="codigo-manual">Contenido del QR</label>
                    <input
                      id="codigo-manual"
                      value={manual}
                      onChange={(e) => setManual(e.target.value)}
                      placeholder="relata:…"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <button className="btn ghost small" type="submit" disabled={ocupado || !manual.trim()}>
                    Identificar
                  </button>
                </form>
              </details>
            )}
          </section>
        )}

        {/* Paso 2: insertar latas */}
        {fase === "identificado" && (
          <section className="card" aria-labelledby="paso-2">
            <div className={s.persona}>
              <div>
                <p className={s.paso}>PASO 2 · PERSONA IDENTIFICADA</p>
                <h2 id="paso-2" className={s.titulo}>
                  {alias}
                </h2>
              </div>
              <button className="btn ghost small" type="button" onClick={terminar}>
                Terminar y cambiar persona
              </button>
            </div>
            <p className="muted">¿Qué lata entra? En la máquina real lo decide el código de barras.</p>
            <div className={s.latas}>
              <button className={`btn primary ${s.lata}`} type="button" onClick={() => insertar("auspiciadora")} disabled={ocupado}>
                Lata auspiciadora <span>+{pts(PUNTOS_POR_LATA.auspiciadora)} pts</span>
              </button>
              <button className={`btn ghost ${s.lata}`} type="button" onClick={() => insertar("otra")} disabled={ocupado}>
                Lata de otra marca <span>+{pts(PUNTOS_POR_LATA.otra)} pt</span>
              </button>
            </div>
          </section>
        )}

        {/* Mensajes: aria-live los lee en voz alta a quien usa lector de pantalla */}
        <div aria-live="polite" className={s.live}>
          {ocupado && <p className="muted">Procesando…</p>}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {ultimo && !ocupado && (
            <section className={`card ${s.resultado}`} aria-label="Resultado de la última lata">
              {ultimo.ganoLataGratis && <p className={s.premio}>¡{alias} ganó una lata gratis!</p>}
              {ultimo.subioDeNivel && (
                <p className={s.premio}>
                  ¡Subió al nivel {ultimo.nivel.numero}: {ultimo.nivel.nombre}!
                </p>
              )}
              <dl className={s.cifras}>
                <div>
                  <dt>Puntos</dt>
                  <dd>{pts(ultimo.puntos)}</dd>
                </div>
                <div>
                  <dt>Nivel</dt>
                  <dd>
                    {ultimo.nivel.numero} · {ultimo.nivel.nombre}
                  </dd>
                </div>
                <div>
                  <dt>Latas gratis</dt>
                  <dd>{ultimo.latasGratis}</dd>
                </div>
              </dl>
              <p className="muted">
                {ultimo.siguienteNivel
                  ? `Le faltan ${pts(ultimo.siguienteNivel.faltan)} puntos para ${ultimo.siguienteNivel.nombre}.`
                  : "Está en el nivel máximo."}{" "}
                En esta sesión: {sesion.length} {sesion.length === 1 ? "lata" : "latas"}.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
