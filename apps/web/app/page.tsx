import {
  ArrowRight,
  ArrowUpRight,
  Bitcoin,
  Code2,
  Database,
  Euro,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { CalculatorCard } from "../components/calculator-card";
import { Header } from "../components/header";

type Rate = {
  provider: string;
  pair: string;
  buy: number;
  updatedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const money = (value: number) =>
  value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function getRates(): Promise<Rate[]> {
  try {
    const response = await fetch(`${API}/v1/rates`, { cache: "no-store" });
    if (!response.ok) return [];
    return (await response.json()) as Rate[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const currentRates = await getRates();
  const usd = currentRates.find(
    (rate) => rate.provider === "BCV" && rate.pair === "USD/VES",
  );
  const usdt = currentRates.find(
    (rate) => rate.provider === "BINANCE_P2P" && rate.pair === "USDT/VES",
  );
  const eur = currentRates.find(
    (rate) => rate.provider === "BCV" && rate.pair === "EUR/VES",
  );
  const latestRate = currentRates.reduce<Rate | undefined>(
    (latest, rate) =>
      !latest || rate.updatedAt > latest.updatedAt ? rate : latest,
    undefined,
  );
  const updatedLabel = latestRate
    ? new Date(latestRate.updatedAt).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Sin datos actuales";
  const rates = [
    {
      provider: "BCV",
      pair: "USD / VES",
      value: usd ? money(usd.buy) : "No disponible",
      tone: "",
      Icon: Landmark,
    },
    {
      provider: "Mercado P2P",
      pair: "USDT / VES",
      value: usdt ? money(usdt.buy) : "No disponible",
      tone: "coral",
      Icon: Bitcoin,
    },
    {
      provider: "BCV",
      pair: "EUR / VES",
      value: eur ? money(eur.buy) : "No disponible",
      tone: "",
      Icon: Euro,
    },
  ];

  return (
    <div className="site-shell">
      <Header />
      <main>
        <section className="container hero">
          <div className="hero-copy">
            <p className="eyebrow">Datos que aterrizan · Venezuela</p>
            <h1 className="display-title">
              La tasa que
              <br />
              te da <em>claridad.</em>
            </h1>
            <p>
              CrystoDolar reúne tasas verificadas, conversión e histórico en una
              experiencia simple para cada venezolano y una API que tus
              productos pueden entender.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/docs">
                Explorar la API <ArrowRight size={16} />
              </Link>
              <Link className="button button-ghost" href="/historico">
                Ver histórico <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="trust-row">
              <span>
                <i className="live-dot" /> Fuentes verificadas
              </span>
              <span>BCV cada 6 h · mercado cada 1 h</span>
              <span>Sin SDK obligatorio</span>
            </div>
          </div>
          <div className="hero-stage" id="calculadora">
            <CalculatorCard compact />
          </div>
        </section>

        <section className="home-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="section-kicker">La lectura de hoy</p>
                <h2 className="section-title">Una pantalla. Toda la señal.</h2>
              </div>
              <p>
                Compara fuentes, entiende la brecha y convierte sin perderte
                entre números. La información importante queda siempre a la
                vista.
              </p>
            </div>
            <div className="home-rates">
              <div className="panel rate-showcase">
                <div className="rate-showcase-head">
                  <span>Principales referencias</span>
                  <span>Actualizado · {updatedLabel}</span>
                </div>
                {rates.map((rate) => (
                  <div
                    className="rate-row"
                    key={`${rate.provider}-${rate.pair}`}
                  >
                    <div className="rate-provider">
                      <span className={`source-icon ${rate.tone}`}>
                        <rate.Icon size={17} />
                      </span>
                      <div>
                        <strong>{rate.provider}</strong>
                        <div className="rate-pair">{rate.pair}</div>
                      </div>
                    </div>
                    <div className="rate-number">
                      {rate.value} <small>Bs.</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="feature-grid">
                <article className="card feature-card">
                  <span className="feature-icon">
                    <ShieldCheck size={19} />
                  </span>
                  <h3>Fuentes con contexto</h3>
                  <p>
                    BCV, P2P y más proveedores separados para que cada cifra
                    tenga sentido.
                  </p>
                </article>
                <article className="card feature-card">
                  <span className="feature-icon">
                    <Database size={19} />
                  </span>
                  <h3>Histórico que permanece</h3>
                  <p>
                    Eventos append-only para seguir cambios, comparar días y
                    tomar decisiones.
                  </p>
                </article>
                <article className="card feature-card">
                  <span className="feature-icon">
                    <Code2 size={19} />
                  </span>
                  <h3>API sin fricción</h3>
                  <p>
                    JSON claro, documentación útil y 500 solicitudes mensuales
                    gratis.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section">
          <div className="container">
            <div className="panel cta-panel">
              <div>
                <p className="section-kicker">Para personas y productos</p>
                <h2 className="section-title">
                  La tasa que necesitas, donde la necesitas.
                </h2>
                <p>
                  Usa la calculadora desde el inicio o conecta tu producto a una
                  API lista para crecer con nuevas monedas y fuentes.
                </p>
              </div>
              <div className="hero-actions">
                <Link className="button button-primary" href="/#calculadora">
                  Usar calculadora <ArrowUpRight size={16} />
                </Link>
                <Link className="button button-secondary" href="/verify">
                  Obtener API key
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 CrystoDolar · Claridad para Venezuela.</span>
          <div className="footer-links">
            <Link href="/historico">Histórico</Link>
            <Link href="/docs">Documentación</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
