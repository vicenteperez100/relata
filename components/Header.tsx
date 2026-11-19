"use client";

// "use client" porque necesitamos saber en qué página estamos (usePathname)
// para marcar la pestaña activa del menú.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/mi-cuenta", label: "Mi cuenta" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="top">
      <Link className="brand" href="/" aria-label="ReLata, ir al inicio">
        <Logo />
      </Link>
      <nav className="main-nav" aria-label="Principal">
        {LINKS.map(({ href, label }) => {
          const activo =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href) || (href === "/mi-cuenta" && pathname.startsWith("/ingresar"));
          return (
            <Link key={href} href={href} aria-current={activo ? "page" : undefined}>
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
