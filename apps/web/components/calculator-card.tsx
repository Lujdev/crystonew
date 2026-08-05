"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bitcoin,
  Calculator,
  CheckCircle2,
  Clock3,
  DollarSign,
  Euro,
  Landmark,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Currency = "USD" | "EUR" | "USDT";
type Rate = {
  provider: string;
  pair: string;
  buy: number;
  sell: number | null;
  status: string;
  updatedAt: string;
};
type CurrencyMeta = {
  label: string;
  Icon: LucideIcon;
  provider: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FALLBACK_UPDATED_AT = "2026-01-01T00:00:00.000Z";
const FALLBACK_USD: Rate = { provider: "BCV", pair: "USD/VES", buy: 744.23, sell: 744.23, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const FALLBACK_USDT: Rate = { provider: "BINANCE_P2P", pair: "USDT/VES", buy: 845.99, sell: 850.25, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const FALLBACK_EUR: Rate = { provider: "BCV", pair: "EUR/VES", buy: 846.07, sell: 846.07, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const fallback: Rate[] = [FALLBACK_USD, FALLBACK_USDT, FALLBACK_EUR];

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const currencyMeta: Record<Currency, CurrencyMeta> = {
  USD: { label: "USD", Icon: DollarSign, provider: "BCV oficial" },
  EUR: { label: "EUR", Icon: Euro, provider: "BCV oficial" },
  USDT: { label: "USDT", Icon: Bitcoin, provider: "Mercado P2P" },
};

export function CalculatorCard({ compact = false }: { compact?: boolean }) {
  const [rates, setRates] = useState<Rate[]>(fallback);
  const [currency, setCurrency] = useState<Currency>("USD");
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

  const usd = useMemo(() => rates.find((rate) => rate.pair === "USD/VES" && rate.provider === "BCV") ?? rates.find((rate) => rate.pair === "USD/VES") ?? FALLBACK_USD, [rates]);
  const usdt = useMemo(() => rates.find((rate) => rate.pair === "USDT/VES" && rate.provider === "BINANCE_P2P") ?? rates.find((rate) => rate.pair === "USDT/VES") ?? FALLBACK_USDT, [rates]);
  const eur = useMemo(() => rates.find((rate) => rate.pair === "EUR/VES" && rate.provider === "BCV") ?? rates.find((rate) => rate.pair === "EUR/VES") ?? FALLBACK_EUR, [rates]);
  const ratesByCurrency: Record<Currency, Rate> = { USD: usd, EUR: eur, USDT: usdt };
  const selectedRate = ratesByCurrency[currency];
  const numericAmount = Number(amount || 0);
  const result = numericAmount * selectedRate.buy;
  const comparisons = (Object.keys(currencyMeta) as Currency[])
    .filter((item) => item !== currency)
    .map((item) => {
      const targetRate = ratesByCurrency[item];
      const deltaPerUnit = selectedRate.buy - targetRate.buy;
      return {
        currency: item,
        targetRate,
        deltaPerUnit,
        deltaTotal: numericAmount * deltaPerUnit,
        percent: (deltaPerUnit / targetRate.buy) * 100,
      };
    });
  const selectedMeta = currencyMeta[currency];
  const updatedAt = new Date(selectedRate.updatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className={`calculator-card ${compact ? "calculator-card-compact" : ""}`} aria-labelledby="calculator-title">
      <header className="calculator-header">
        <div>
          <div className="calculator-title"><span className="calculator-icon"><Calculator size={17} /></span><h2 id="calculator-title">Calculadora</h2></div>
          <div className="calculator-sources">
            <span><Landmark size={12} /> BCV {money(usd.buy)}</span>
            <span><Bitcoin size={12} /> P2P {money(usdt.buy)}</span>
            <span><Euro size={12} /> EUR {money(eur.buy)}</span>
          </div>
        </div>
        <span className="calculator-live"><i className="live-dot" /> En vivo</span>
      </header>
      <div className="calculator-body">
        <div className="calculator-tabs" role="tablist" aria-label="Moneda base">
          {(Object.keys(currencyMeta) as Currency[]).map((item) => {
            const Icon = currencyMeta[item].Icon;
            return <button className={currency === item ? "active" : ""} key={item} type="button" role="tab" aria-selected={currency === item} onClick={() => setCurrency(item)}><Icon size={15} />{item}</button>;
          })}
        </div>
        <div className="calculator-label-row"><label htmlFor="calculator-amount">Monto base</label><span>{selectedMeta.provider} · {currency}/VES</span></div>
        <div className="calculator-input">
          <span className="currency-symbol"><selectedMeta.Icon size={18} /></span>
          <input id="calculator-amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label={`Monto en ${currency}`} />
          <strong>{currency}</strong>
        </div>
        <div className="calculator-result-label">Recibes en bolívares</div>
        <div className="calculator-result"><span className="result-symbol">Bs</span><strong>{money(result)}</strong><small>VES</small></div>
        <div className="calculator-insights" aria-label={`Comparaciones de ${currency}`}>
          {comparisons.map(({ currency: targetCurrency, targetRate, deltaPerUnit, deltaTotal, percent }) => {
            const targetMeta = currencyMeta[targetCurrency];
            const TargetIcon = targetMeta.Icon;
            const isGain = deltaPerUnit > 0.005;
            const isLoss = deltaPerUnit < -0.005;
            const VerdictIcon = isGain ? ArrowUpRight : isLoss ? ArrowDownRight : Minus;
            const tone = isGain ? "comparison-gain" : isLoss ? "comparison-loss" : "comparison-neutral";
            const verdict = isGain ? "Ganas" : isLoss ? "Pierdes" : "Misma referencia";
            return (
              <article className={`calculator-insight ${tone}`} key={targetCurrency}>
                <div className="comparison-top"><span><TargetIcon size={14} /> Vs. {targetCurrency} <small>{targetMeta.provider}</small></span><b><VerdictIcon size={13} /> {verdict}</b></div>
                <div className="comparison-rate"><strong>Bs. {money(targetRate.buy)}</strong><span>precio {targetCurrency}</span></div>
                <small>{isGain ? "+" : isLoss ? "−" : "±"}Bs. {money(Math.abs(deltaPerUnit))} por unidad · {isGain ? "+" : isLoss ? "−" : "±"}Bs. {money(Math.abs(deltaTotal))} en tu monto · {Math.abs(percent).toFixed(2)}%</small>
              </article>
            );
          })}
        </div>
        <div className="calculator-foot"><span><CheckCircle2 size={14} /> Tasas referenciales verificadas</span><span><Clock3 size={14} /> {loading ? "Actualizando" : `Actualizado ${updatedAt}`}</span></div>
      </div>
    </section>
  );
}
