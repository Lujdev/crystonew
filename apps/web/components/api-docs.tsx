"use client";

import { Check, Copy, Info } from "lucide-react";
import { useState } from "react";

const snippets = {
  rates: "curl https://api.crystodolar.app/v1/rates",
  convert: "curl 'https://api.crystodolar.app/v1/convert?amount=100&from=USD&to=VES'",
  history: "curl 'https://api.crystodolar.app/v1/history/USD%2FVES?days=30'",
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <pre className="code-block"><code>{code}</code><button className="copy-button" type="button" onClick={copy}>{copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}</button></pre>
  );
}

export function ApiDocs() {
  return (
    <div className="docs-layout">
      <aside className="docs-sidebar" aria-label="En esta página">
        <strong>En esta página</strong>
        <a href="#overview">Overview</a>
        <a href="#auth">Autenticación</a>
        <a href="#endpoints">Endpoints</a>
        <a href="#examples">Ejemplos</a>
        <a href="#keys">Obtener key</a>
      </aside>
      <div>
        <section id="overview" className="docs-intro">
          <p className="eyebrow">CrystoDolar API · v1</p>
          <h1>Datos claros para productos reales.</h1>
          <p>Infraestructura de tasas venezolanas con respuestas JSON predecibles, histórico y conversión. Pública para consultar; gratuita para integrar.</p>
          <div className="docs-meta-grid">
            <div className="card docs-meta"><span>Base URL</span><strong>https://api.crystodolar.app</strong></div>
            <div className="card docs-meta"><span>Versión</span><strong>v1</strong></div>
            <div className="card docs-meta"><span>Formato</span><strong>JSON</strong></div>
            <div className="card docs-meta"><span>Cuota Free</span><strong>500 / mes</strong></div>
          </div>
        </section>

        <section id="auth" className="docs-section">
          <h2>Autenticación</h2>
          <p>Las tasas públicas se pueden consultar sin clave. Si tu producto necesita usar la API de forma sostenida, solicita una API key Free con tu correo.</p>
          <div className="docs-note"><Info size={17} /> La clave se envía como <code>Authorization: Bearer &lt;API_KEY&gt;</code>. Nunca la expongas en el navegador ni en repositorios públicos.</div>
        </section>

        <section id="endpoints" className="docs-section">
          <h2>Endpoints</h2>
          <p>Todo responde con JSON y timestamps ISO 8601. Las tasas están expresadas en bolívares por unidad de moneda extranjera.</p>
          <div className="endpoint-list">
            <article className="endpoint-card"><div className="endpoint-top"><span className="method">GET</span><code className="endpoint-path">/v1/rates</code><span className="endpoint-description">Tasas actuales</span></div><CodeBlock code={snippets.rates} /></article>
            <article className="endpoint-card"><div className="endpoint-top"><span className="method">GET</span><code className="endpoint-path">/v1/status</code><span className="endpoint-description">Estado de fuentes</span></div><CodeBlock code="curl https://api.crystodolar.app/v1/status" /></article>
            <article className="endpoint-card"><div className="endpoint-top"><span className="method">GET</span><code className="endpoint-path">/v1/convert</code><span className="endpoint-description">Conversión</span></div><CodeBlock code={snippets.convert} /></article>
            <article className="endpoint-card"><div className="endpoint-top"><span className="method">GET</span><code className="endpoint-path">/v1/history/:pairCode</code><span className="endpoint-description">Histórico</span></div><CodeBlock code={snippets.history} /></article>
          </div>
        </section>

        <section id="examples" className="docs-section">
          <h2>Respuesta de ejemplo</h2>
          <p>Una respuesta compacta para que puedas renderizar la información sin adaptadores complejos.</p>
          <CodeBlock code={'[{\n  "provider": "BCV",\n  "pair": "USD/VES",\n  "buy": 744.23,\n  "sell": 744.23,\n  "status": "verified",\n  "updatedAt": "2026-08-05T01:42:10.000Z"\n}]'} />
        </section>

        <section id="keys" className="docs-section">
          <h2>Obtén tu API key</h2>
          <p>Solicita acceso Free con magic link. No hay selector de planes: todos comienzan con 500 solicitudes mensuales.</p>
          <a href="/verify" className="button button-primary" style={{ marginTop: 22 }}>Solicitar acceso</a>
        </section>
      </div>
    </div>
  );
}
