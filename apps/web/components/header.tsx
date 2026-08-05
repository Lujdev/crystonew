import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="CrystoDolar inicio">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="brand-mark"
          />
          <span className="brand-name">
            Crysto<span>Dolar</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label="Navegación principal">
          <Link href="/#calculadora">Calculadora</Link>
          <Link href="/historico">Histórico</Link>
          <Link href="/docs">Documentación</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link className="button button-primary" href="/verify">
            Obtener API key
          </Link>
        </div>
      </div>
    </header>
  );
}
