import Link from "next/link";
import { Header } from "../components/header";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container py-20 md:py-28">
        <section className="max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-green-300">
            API y app para Venezuela
          </p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Menos incertidumbre.{" "}
            <span className="text-green-300">Más claridad.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 muted">
            CrystoDolar reúne tasas verificadas, histórico, conversión y una API
            REST simple para productos que necesitan responder con datos reales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button button-primary" href="/app">
              Ver la app
            </Link>
            <Link className="button button-secondary" href="/docs">
              Leer documentación
            </Link>
          </div>
        </section>
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          <div className="panel p-6">
            <p className="muted">Fuentes</p>
            <p className="mt-3 text-3xl font-black">BCV + P2P</p>
          </div>
          <div className="panel p-6">
            <p className="muted">Histórico</p>
            <p className="mt-3 text-3xl font-black">30 días+</p>
          </div>
          <div className="panel p-6">
            <p className="muted">API</p>
            <p className="mt-3 text-3xl font-black">REST JSON</p>
          </div>
        </section>
      </main>
    </>
  );
}
