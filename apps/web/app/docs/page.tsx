import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../components/header";
export const metadata: Metadata = {
  title: "Documentación API",
  description: "Integra CrystoDolar con una API REST clara y predecible.",
};
export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="container py-16">
        <p className="text-sm font-bold uppercase tracking-[.25em] text-green-300">
          Documentación
        </p>
        <h1 className="mt-4 text-4xl font-black">Una API que responde.</h1>
        <p className="mt-4 max-w-2xl leading-7 muted">
          Consulta tasas actuales, histórico, conversiones y estado de fuentes
          usando JSON. Sin SDK obligatorio.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="panel p-6">
            <p className="muted">Endpoint público</p>
            <code className="mt-3 block rounded-xl bg-slate-950 p-4 text-green-300">
              GET /v1/rates
            </code>
          </div>
          <div className="panel p-6">
            <p className="muted">Conversión</p>
            <code className="mt-3 block rounded-xl bg-slate-950 p-4 text-green-300">
              GET /v1/convert
            </code>
          </div>
        </div>
        <section id="keys" className="panel mt-6 p-8">
          <h2 className="text-2xl font-bold">Obtén tu API key</h2>
          <p className="mt-3 muted">
            Solicita un magic link por correo. El plan Free incluye 500
            solicitudes mensuales y Development 10.000.
          </p>
          <Link href="/verify" className="button button-primary mt-6">
            Solicitar acceso
          </Link>
        </section>
      </main>
    </>
  );
}
