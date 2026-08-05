import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../components/header";
export const metadata: Metadata = {
  title: "Histórico de tasas",
  description: "Consulta el histórico de las tasas de cambio venezolanas.",
};
export default function HistoryPage() {
  return (
    <>
      <Header />
      <main className="container py-16">
        <p className="text-sm font-bold uppercase tracking-[.25em] text-green-300">
          Histórico
        </p>
        <h1 className="mt-4 text-4xl font-black">
          La evolución detrás de la tasa.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 muted">
          Explora los registros por par, proveedor y período. La visualización
          interactiva llegará sobre el mismo histórico que alimenta la API.
        </p>
        <div className="panel mt-10 p-8">
          <p className="text-lg font-bold">Histórico disponible</p>
          <p className="mt-2 muted">
            Usa `/v1/history/USD/VES?days=30` desde la API mientras construimos
            las gráficas.
          </p>
          <Link className="button button-primary mt-6" href="/docs">
            Ver API
          </Link>
        </div>
      </main>
    </>
  );
}
