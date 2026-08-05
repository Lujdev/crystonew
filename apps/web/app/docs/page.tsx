import type { Metadata } from "next";
import { ApiDocs } from "../../components/api-docs";
import { Header } from "../../components/header";

export const metadata: Metadata = {
  title: "Documentación API",
  description:
    "Integra CrystoDolar con una API REST clara, pública y predecible.",
};

export default function DocsPage() {
  return (
    <div className="site-shell">
      <Header />
      <main className="container docs-page">
        <ApiDocs />
      </main>
    </div>
  );
}
