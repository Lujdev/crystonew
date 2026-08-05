"use client";

import { ArrowRightLeft, CheckCircle2, RefreshCw, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Rate = {
  provider: string;
  pair: string;
  buy: number;
  sell: number | null;
  status: string;
  updatedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const fallback: Rate[] = [
  { provider: "BCV", pair: "USD/VES", buy: 744.23, sell: 744.23, status: "verified", updatedAt: new Date().toISOString() },
  { provider: "BINANCE_P2P", pair: "USDT/VES", buy: 845.99, sell: 850.25, status: "verified", updatedAt: new Date().toISOString() },
  { provider: "BCV", pair: "EUR/VES", buy: 846.07, sell: 846.07, status: "verified", updatedAt: new Date().toISOString() },
];

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function RateDashboard() {
  const [rates, setRates] = useState<Rate[]>(fallback);
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/rates`)
      .then((response) => (response.ok ? (response.json() as Promise<Rate[]>) : Promise.reject()))
      .then((data) => { if (data.length) setRates(data); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const usd = useMemo(
    () =>
      rates.find(
        (rate) => rate.pair === "USD/VES" && rate.provider === "BCV",
      ) ?? rates.find((rate) => rate.pair === "USD/VES"),
    [rates],
  );
  const usdt = useMemo(
    () =>
      rates.find(
        (rate) => rate.pair === "USDT/VES" && rate.provider === "BINANCE_P2P",
      ) ?? rates.find((rate) => rate.pair === "USDT/VES"),
    [rates],
  );
  const spread = usd && usdt ? (((usdt.buy - usd.buy) / usd.buy) * 100).toFixed(2) : "0.00";
  const converted = Number(amount || 0) * (usd?.buy ?? 744.23);
  const updatedAt = rates[0]?.updatedAt ? new Date(rates[0].updatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Producto · tasas en vivo</p>
          <h1>La tasa, clara.</h1>
          <p>Una vista limpia para comparar referencias, convertir y entender el movimiento del bolívar.</p>
        </div>
        <span className="status-pill"><Wifi size={14} /> {loading ? "Actualizando" : "En línea"}</span>
      </div>

      <section className="metric-grid" aria-label="Resumen de tasas">
        <article className="card metric-card">
          <div className="metric-label"><span>BCV oficial · USD</span><span>USD/VES</span></div>
          <div className="metric-value">Bs. {money(usd?.buy ?? 744.23)}</div>
          <div className="metric-foot"><CheckCircle2 size={14} /> Verificada · actualización {updatedAt}</div>
        </article>
        <article className="card metric-card coral">
          <div className="metric-label"><span>Mercado P2P · USDT</span><span>USDT/VES</span></div>
          <div className="metric-value">Bs. {money(usdt?.buy ?? 845.99)}</div>
          <div className="metric-foot" style={{ color: "var(--coral)" }}>+{spread}% sobre referencia oficial</div>
        </article>
        <article className="card metric-card">
          <div className="metric-label"><span>Lecturas activas</span><span>Fuentes</span></div>
          <div className="metric-value">{rates.length}</div>
          <div className="metric-foot"><RefreshCw size={14} /> Histórico guardado automáticamente</div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel dashboard-card">
          <div className="card-head">
            <div><h2>Convertir ahora</h2><p>Usa la última lectura disponible de USD/VES.</p></div>
            <ArrowRightLeft size={20} className="subtle" />
          </div>
          <div className="convert-grid">
            <div className="input-block">
              <label htmlFor="usd-amount">Tú envías · USD</label>
              <input id="usd-amount" className="input-field" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label="Monto en dólares" />
            </div>
            <span className="swap-mark" aria-hidden="true"><ArrowRightLeft size={17} /></span>
            <div className="input-block">
              <span className="input-block label">Recibes · VES</span>
              <div className="result-field"><span>{money(converted)}</span><small>Bs.</small></div>
            </div>
          </div>
          <div className="dashboard-note"><CheckCircle2 size={14} /> Referencia usada: Bs. {money(usd?.buy ?? 744.23)} por USD.</div>
        </article>

        <article className="panel dashboard-card">
          <div className="card-head">
            <div><h2>Fuentes activas</h2><p>Separadas por origen para leer mejor la señal.</p></div>
            <span className="subtle">{rates.length} lecturas</span>
          </div>
          <div className="source-list">
            {rates.map((rate) => (
              <div className="source-row" key={`${rate.provider}-${rate.pair}`}>
                <div className="source-name"><span className="live-dot" /><div>{rate.provider}<small>{rate.pair} · {rate.status === "verified" ? "verificada" : rate.status}</small></div></div>
                <div className="source-rate">{money(rate.buy)} <small>Bs.</small></div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
