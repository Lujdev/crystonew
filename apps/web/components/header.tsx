import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-800/80">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-black">
          <Image
            src="/logo.png"
            alt="CrystoDolar"
            width={36}
            height={36}
            className="rounded-xl"
          />
          <span>CrystoDolar</span>
        </Link>
        <nav className="hidden gap-5 text-sm text-slate-300 md:flex">
          <Link href="/app">App</Link>
          <Link href="/historico">Histórico</Link>
          <Link href="/docs">API</Link>
        </nav>
        <Link className="button button-primary text-sm" href="/docs#keys">
          Obtener API key
        </Link>
      </div>
    </header>
  );
}
