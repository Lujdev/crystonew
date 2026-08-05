"use client";

import { CalendarDays, CheckCircle2, LoaderCircle, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HistoryPoint = { id: number; provider: string; providerName: string; buy: number; sell: number | null; status: string; recordedAt: string };
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const pairs = ["USD/VES", "USDT/VES", "EUR/VES"];
const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function HistoryView() {
  const [pair, setPair] = useState("USD/VES");
  const [days, setDays] = useState(30);
  const [source, setSource] = useState("");
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/history/${encodeURIComponent(pair)}?days=${days}`)
      .then((response) => (response.ok ? (response.json() as Promise<HistoryPoint[]>) : Promise.reject()))
      .then((data) => {
        setPoints(data);
        const available = [...new Set(data.map((point) => point.provider))];
        setSource((current) => (current && available.includes(current) ? current : available[0] ?? ""));
      })
      .catch(() => { setPoints([]); setSource(""); })
      .finally(() => setLoading(false));
  }, [pair, days]);

  const sources = useMemo(() => [...new Set(points.map((point) => point.provider))], [points]);
  const visiblePoints = useMemo(() => source ? points.filter((point) => point.provider === source) : points, [points, source]);
  const chart = useMemo(() => {
    if (!visiblePoints.length) return null;
    const values = visiblePoints.flatMap((point) => point.sell === null ? [point.buy] : [point.buy, point.sell]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const xFor = (index: number) => 18 + (index * 604) / Math.max(visiblePoints.length - 1, 1);
    const yFor = (value: number) => 198 - ((value - min) / range) * 160;
    const buyLine = visiblePoints.map((point, index) => `${xFor(index)},${yFor(point.buy)}`).join(" ");
    const sellPoints = visiblePoints.flatMap((point, index) => point.sell === null ? [] : [`${xFor(index)},${yFor(point.sell)}`]);
    return { buyLine, sellLine: sellPoints.join(" "), area: `18,198 ${buyLine} 622,198`, min, max };
  }, [visiblePoints]);

  return (
    <>
      <div className="history-toolbar">
        <div className="segmented" aria-label="Elegir par">
          {pairs.map((item) => <button key={item} className={`segment ${pair === item ? "active" : ""}`} type="button" onClick={() => setPair(item)}>{item}</button>)}
        </div>
        <div className="segmented" aria-label="Elegir período">
          {[7, 30].map((item) => <button key={item} className={`segment ${days === item ? "active" : ""}`} type="button" onClick={() => setDays(item)}>{item} días</button>)}
        </div>
        {sources.length > 1 && <div className="segmented" aria-label="Elegir fuente">{sources.map((item) => <button key={item} className={`segment ${source === item ? "active" : ""}`} type="button" onClick={() => setSource(item)}>{item}</button>)}</div>}
      </div>
      <section className="panel chart-card">
        <div className="card-head"><div><h2>{pair} · compra y venta</h2><p>Lecturas únicas por fuente y día; las repeticiones sin cambios no se vuelven a guardar.</p></div><span className="status-pill"><TrendingUp size={14} /> {visiblePoints.length ? `${visiblePoints.length} lecturas` : "Sin datos"}</span></div>
        {loading ? <div className="empty-state"><LoaderCircle className="animate-spin" size={24} /> Cargando histórico…</div> : chart ? <><div className="history-legend"><span><i className="legend-buy" /> Compra</span><span><i className="legend-sell" /> Venta</span><span className="subtle">{source || "Todas las fuentes"}</span></div><div className="chart-wrap"><svg className="chart-svg" viewBox="0 0 640 220" role="img" aria-label={`Gráfico histórico de compra y venta de ${pair}`}><defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity="0.45" /><stop offset="100%" stopColor="var(--brand)" stopOpacity="0" /></linearGradient></defs><line className="chart-grid-line" x1="18" x2="622" y1="38" y2="38" /><line className="chart-grid-line" x1="18" x2="622" y1="118" y2="118" /><line className="chart-grid-line" x1="18" x2="622" y1="198" y2="198" /><polygon className="chart-area" points={chart.area} /><polyline className="chart-line chart-buy-line" points={chart.buyLine} />{chart.sellLine && <polyline className="chart-line chart-sell-line" points={chart.sellLine} />}<text x="18" y="17" fill="var(--muted)" fontSize="12">Bs. {money(chart.max)}</text><text x="18" y="216" fill="var(--muted)" fontSize="12">Bs. {money(chart.min)}</text></svg></div></> : <div className="empty-state">Todavía no hay lecturas para este par.</div>}
      </section>
      <section className="panel history-table-wrap">
        {visiblePoints.length ? <table className="history-table"><thead><tr><th>Fecha</th><th>Fuente</th><th>Compra</th><th>Venta</th><th>Estado</th></tr></thead><tbody>{visiblePoints.slice().reverse().map((point, index) => <tr key={`${point.id ?? point.provider}-${point.recordedAt}-${index}`}><td><span className="history-date"><CalendarDays size={14} className="subtle" /> {new Date(point.recordedAt).toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" })}</span></td><td><strong>{point.provider}</strong><small className="history-provider-name">{point.providerName}</small></td><td><strong>Bs. {money(point.buy)}</strong></td><td>{point.sell === null ? "—" : `Bs. ${money(point.sell)}`}</td><td><span className="history-status"><CheckCircle2 size={14} /> {point.status === "verified" ? "Verificada" : point.status}</span></td></tr>)}</tbody></table> : <div className="empty-state">El histórico aparecerá aquí después de la primera sincronización.</div>}
      </section>
    </>
  );
}
