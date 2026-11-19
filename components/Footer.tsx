import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <span>ReLata · Prototipo del curso TEI101, Universidad Adolfo Ibáñez · Grupo 2</span>
      <span>Felix Villard, Matias Lobos, Vicente Perez y Agustin Garcia</span>
      <span>
        <Link href="/privacidad">Privacidad</Link>
      </span>
    </footer>
  );
}
