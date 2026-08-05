import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Code2,
  Database,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "../components/header";

const rates = [
  { provider: "BCV oficial", pair: "USD / VES", value: "744,23", tone: "" },
  {
    provider: "Mercado P2P",
    pair: "USDT / VES",
    value: "845,99",
    tone: "coral",
  },
  { provider: "BCV oficial", pair: "EUR / VES", value: "846,07", tone: "" },
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
              <Link className="button button-primary" href="/app">
                Abrir calculadora <ArrowUpRight size={16} />
              </Link>
              <Link className="button button-ghost" href="/docs">
                Explorar la API <ArrowRight size={16} />
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

          <div className="hero-stage">
            <div className="hero-orbit" />
            <div className="hero-logo-card">
              <Image
                src="/logo.png"
                alt="CrystoDolar"
                width={126}
                height={126}
              />
            </div>
            <div className="hero-terminal">
              <div className="terminal-top">
                <span>CrystoDolar · live</span>
                <span className="terminal-dots" aria-hidden="true">
                  <i /> <i /> <i />
                </span>
              </div>
              <div className="terminal-body">
                <div className="terminal-label">USD/VES · BCV</div>
                <div className="terminal-value">Bs. 744,23</div>
                <svg
                  className="sparkline"
                  viewBox="0 0 390 82"
                  role="img"
                  aria-label="Tendencia estable"
                >
                  <line x1="0" x2="390" y1="18" y2="18" />
                  <line x1="0" x2="390" y1="42" y2="42" />
                  <line x1="0" x2="390" y1="66" y2="66" />
                  <path d="M4 59 C28 58, 40 46, 62 50 S101 42, 124 47 S166 21, 187 30 S220 20, 244 28 S276 45, 298 33 S336 37, 352 21 S375 15, 386 8" />
                </svg>
                <div className="terminal-footer">
                  <span>Última lectura · hace 2 min</span>
                  <strong>+0,42%</strong>
                </div>
              </div>
            </div>
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
                        <BarChart3 size={17} />
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
                  Usa la app para convertir hoy o conecta tu producto a una API
                  lista para crecer con nuevas monedas y fuentes.
                </p>
              </div>
              <div className="hero-actions">
                <Link className="button button-primary" href="/app">
                  Ver tasas <ArrowUpRight size={16} />
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
