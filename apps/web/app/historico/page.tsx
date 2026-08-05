import type { Metadata } from "next";
import { Header } from "../../components/header";
import { HistoryView } from "../../components/history-view";

export const metadata: Metadata = {
  title: "Histórico de tasas",
  description: "Explora el histórico de las tasas de cambio venezolanas.",
};

export default function HistoryPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="container history-page">
        <section className="history-intro">
          <p className="eyebrow">Histórico · señal que permanece</p>
          <h1>La evolución detrás de la tasa.</h1>
          <p>
            Compara períodos, cambia de par y entiende el contexto detrás de
            cada lectura. Los eventos se conservan para que una cifra de hoy
            tenga memoria.
          </p>
        </section>
        <HistoryView />
      </main>
    </div>
  );
}
