"use client";

// Se muestra si algo falla al cargar una página (por ejemplo, si Supabase no
// responde o faltan variables de entorno). El detalle técnico queda en la terminal.
export default function ErrorPagina({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="placeholder" role="alert">
      <p className="eyebrow">Error</p>
      <h1>No pudimos cargar esta página</h1>
      <p className="muted">
        Puede ser un problema de conexión. Intenta de nuevo en unos segundos. Si estás trabajando en el
        proyecto, revisa la terminal donde corre <code>npm run dev</code>.
      </p>
      <div>
        <button className="btn primary" type="button" onClick={reset}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
