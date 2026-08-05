import type { Metadata } from "next";
import { Header } from "../../components/header";
import { RateDashboard } from "../../components/rate-dashboard";

export const metadata: Metadata = {
  title: "App de tasas",
  description: "Consulta tasas, compara fuentes y convierte USD a VES.",
};

export default function AppPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="container dashboard-page">
        <RateDashboard />
      </main>
    </div>
  );
}
