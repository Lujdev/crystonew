import type { Metadata } from "next";
import { Header } from "../../components/header";
import { RateDashboard } from "../../components/rate-dashboard";
export const metadata: Metadata = { title: "App" };
export default function AppPage() {
  return (
    <>
      <Header />
      <main className="container py-10">
        <RateDashboard />
      </main>
    </>
  );
}
