"use client";

import { CalendarDays, CheckCircle2, LoaderCircle, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HistoryPoint = { buy: number; sell: number | null; status: string; recordedAt: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const pairs = ["USD/VES", "USDT/VES", "EUR/VES"];
const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function HistoryView() {
  const [pair, setPair] = useState("USD/VES");
  const [days, setDays] = useState(30);
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/history/${encodeURIComponent(pair)}?days=${days}`)
      .then((response) => (response.ok ? (response.json() as Promise<HistoryPoint[]>) : Promise.reject()))
      .then(setPoints)
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [pair, days]);

  const chart = useMemo(() => {
    const values = points.map((point) => point.buy);
    if (!values.length) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const coords = values.map((value, index) => ({ x: 18 + (index * 604) / Math.max(values.length - 1, 1), y: 198 - ((value - min) / range) * 160 }));
    const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
    const area = `18,198 ${line} 622,198`;
    return { line, area, min, max };
  }, [points]);

  return (
    <>
      <div className="history-toolbar">
        <div className="segmented" aria-label="Elegir par">
          {pairs.map((item) => <button key={item} className={`segment ${pair === item ? "active" : ""}`} type="button" onClick={() => setPair(item)}>{item}</button>)}
        </div>
        <div className="segmented" aria-label="Elegir período">
          {[7, 30].map((item) => <button key={item} className={`segment ${days === item ? "active" : ""}`} type="button" onClick={() => setDays(item)}>{item} días</button>)}
        </div>
      </div>
      <section className="panel chart-card">
        <div className="card-head"><div><h2>{pair} · compra</h2><p>Histórico append-only de todas las fuentes activas.</p></div><span className="status-pill"><TrendingUp size={14} /> {points.length ? `${points.length} lecturas` : "Sin datos"}</span></div>
        {loading ? <div className="empty-state"><LoaderCircle className="animate-spin" size={24} /> Cargando histórico…</div> : chart ? <div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 640 220" role="img" aria-label={`Gráfico histórico de ${pair}`}><defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity="0.45" /><stop offset="100%" stopColor="var(--brand)" stopOpacity="0" /></linearGradient></defs><line className="chart-grid-line" x1="18" x2="622" y1="38" y2="38" /><line className="chart-grid-line" x1="18" x2="622" y1="118" y2="118" /><line className="chart-grid-line" x1="18" x2="622" y1="198" y2="198" /><polygon className="chart-area" points={chart.area} /><polyline className="chart-line" points={chart.line} /><text x="18" y="17" fill="var(--muted)" fontSize="12">Bs. {money(chart.max)}</text><text x="18" y="216" fill="var(--muted)" fontSize="12">Bs. {money(chart.min)}</text></svg></div> : <div className="empty-state">Todavía no hay lecturas para este par.</div>}
      </section>
      <section className="panel history-table-wrap">
        {points.length ? <table className="history-table"><thead><tr><th>Fecha</th><th>Compra</th><th>Venta</th><th>Estado</th></tr></thead><tbody>{points.slice().reverse().map((point) => <tr key={point.recordedAt}><td><span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><CalendarDays size={14} className="subtle" /> {new Date(point.recordedAt).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" })}</span></td><td><strong>Bs. {money(point.buy)}</strong></td><td>{point.sell === null ? "—" : `Bs. ${money(point.sell)}`}</td><td><span style={{ color: "var(--lime)", display: "inline-flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> {point.status === "verified" ? "Verificada" : point.status}</span></td></tr>)}</tbody></table> : <div className="empty-state">El histórico aparecerá aquí después de la primera sincronización.</div>}
      </section>
    </>
  );
}
