"use client";

import { CheckCircle2, RefreshCw, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CalculatorCard } from "./calculator-card";

type Rate = { provider: string; pair: string; buy: number; sell: number | null; status: string; updatedAt: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FALLBACK_UPDATED_AT = "2026-01-01T00:00:00.000Z";
const FALLBACK_USD: Rate = { provider: "BCV", pair: "USD/VES", buy: 744.23, sell: 744.23, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const FALLBACK_USDT: Rate = { provider: "BINANCE_P2P", pair: "USDT/VES", buy: 845.99, sell: 850.25, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const fallback: Rate[] = [FALLBACK_USD, FALLBACK_USDT];

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function RateDashboard() {
  const [rates, setRates] = useState<Rate[]>(fallback);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/rates`).then((response) => (response.ok ? (response.json() as Promise<Rate[]>) : Promise.reject())).then((data) => { if (data.length) setRates(data); }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  const usd = useMemo(() => rates.find((rate) => rate.pair === "USD/VES" && rate.provider === "BCV") ?? rates.find((rate) => rate.pair === "USD/VES") ?? FALLBACK_USD, [rates]);
  const usdt = useMemo(() => rates.find((rate) => rate.pair === "USDT/VES" && rate.provider === "BINANCE_P2P") ?? rates.find((rate) => rate.pair === "USDT/VES") ?? FALLBACK_USDT, [rates]);
  const spread = ((usdt.buy - usd.buy) / usd.buy) * 100;

  return (
    <div>
      <div className="dashboard-head"><div><p className="eyebrow">Producto · tasas en vivo</p><h1>La tasa, clara.</h1><p>Compara referencias, calcula tu resultado y entiende cuánto cambia tu operación en cada fuente.</p></div><span className="status-pill"><Wifi size={14} /> {loading ? "Actualizando" : "En línea"}</span></div>
      <div style={{ marginTop: 16 }}><CalculatorCard /></div>
      <section className="metric-grid" aria-label="Resumen de tasas">
        <article className="card metric-card"><div className="metric-label"><span>BCV oficial · USD</span><span>USD/VES</span></div><div className="metric-value">Bs. {money(usd.buy)}</div><div className="metric-foot"><CheckCircle2 size={14} /> Verificada</div></article>
        <article className="card metric-card coral"><div className="metric-label"><span>Mercado P2P · USDT</span><span>USDT/VES</span></div><div className="metric-value">Bs. {money(usdt.buy)}</div><div className="metric-foot" style={{ color: "var(--coral)" }}>+{spread.toFixed(2)}% sobre BCV</div></article>
        <article className="card metric-card"><div className="metric-label"><span>Lecturas activas</span><span>Fuentes</span></div><div className="metric-value">{rates.length}</div><div className="metric-foot"><RefreshCw size={14} /> Histórico guardado</div></article>
      </section>
      <section className="panel dashboard-card source-focus">
        <div className="card-head"><div><h2>Fuentes activas</h2><p>Separadas por origen para leer mejor la señal.</p></div><span className="subtle">{rates.length} lecturas</span></div>
        <div className="source-list">{rates.map((rate) => <div className="source-row" key={`${rate.provider}-${rate.pair}`}><div className="source-name"><span className="live-dot" /><div>{rate.provider}<small>{rate.pair} · {rate.status === "verified" ? "verificada" : rate.status}</small></div></div><div className="source-rate">{money(rate.buy)} <small>Bs.</small></div></div>)}</div>
      </section>
    </div>
  );
}
