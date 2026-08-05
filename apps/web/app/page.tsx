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

const rates = [
  {
    provider: "BCV",
    pair: "USD / VES",
    value: "744,23",
    tone: "",
    Icon: Landmark,
  },
  {
    provider: "Mercado P2P",
    pair: "USDT / VES",
    value: "845,99",
    tone: "coral",
    Icon: Bitcoin,
  },
  {
    provider: "BCV",
    pair: "EUR / VES",
    value: "846,07",
    tone: "",
    Icon: Euro,
  },
];

export default function HomePage() {
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
              <span>Actualización cada 30 min</span>
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
                  <span>Hoy · 05 ago 2026</span>
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
