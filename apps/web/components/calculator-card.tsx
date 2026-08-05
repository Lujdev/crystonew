"use client";

import { Calculator, CheckCircle2, Clock3, TrendingUp } from "lucide-react";
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

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const FALLBACK_UPDATED_AT = "2026-01-01T00:00:00.000Z";
const FALLBACK_USD: Rate = { provider: "BCV", pair: "USD/VES", buy: 744.23, sell: 744.23, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const FALLBACK_USDT: Rate = { provider: "BINANCE_P2P", pair: "USDT/VES", buy: 845.99, sell: 850.25, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const FALLBACK_EUR: Rate = { provider: "BCV", pair: "EUR/VES", buy: 846.07, sell: 846.07, status: "verified", updatedAt: FALLBACK_UPDATED_AT };
const fallback: Rate[] = [FALLBACK_USD, FALLBACK_USDT, FALLBACK_EUR];

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const currencyMeta: Record<Currency, { label: string; icon: string; provider: string }> = {
  USD: { label: "USD", icon: "$", provider: "BCV oficial" },
  EUR: { label: "EUR", icon: "€", provider: "BCV oficial" },
  USDT: { label: "USDT", icon: "₮", provider: "Mercado P2P" },
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
  const values: Record<Currency, number> = { USD: usd.buy, EUR: eur.buy, USDT: usdt.buy };
  const selectedRate = values[currency];
  const numericAmount = Number(amount || 0);
  const result = numericAmount * selectedRate;
  const extraUsdt = numericAmount * (usdt.buy - usd.buy);
  const extraEur = numericAmount * (eur.buy - usd.buy);
  const usdtSpread = ((usdt.buy - usd.buy) / usd.buy) * 100;
  const updatedAt = new Date(selectedRate === usd.buy ? usd.updatedAt : selectedRate === eur.buy ? eur.updatedAt : usdt.updatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className={`calculator-card ${compact ? "calculator-card-compact" : ""}`} aria-labelledby="calculator-title">
      <header className="calculator-header">
        <div>
          <div className="calculator-title"><span className="calculator-icon"><Calculator size={17} /></span><h2 id="calculator-title">Calculadora</h2></div>
          <div className="calculator-sources"><span>⌁ BCV {money(usd.buy)}</span><span>₮ P2P {money(usdt.buy)}</span></div>
        </div>
        <span className="calculator-live"><i className="live-dot" /> En vivo</span>
      </header>
      <div className="calculator-body">
        <div className="calculator-tabs" role="tablist" aria-label="Moneda base">
          {(Object.keys(currencyMeta) as Currency[]).map((item) => (
            <button className={currency === item ? "active" : ""} key={item} type="button" role="tab" aria-selected={currency === item} onClick={() => setCurrency(item)}><span>{currencyMeta[item].icon}</span>{item}</button>
          ))}
        </div>
        <div className="calculator-label-row"><label htmlFor="calculator-amount">Monto base</label><span>{currencyMeta[currency].provider} · {currency}/{"VES"}</span></div>
        <div className="calculator-input">
          <span className="currency-symbol">{currencyMeta[currency].icon}</span>
          <input id="calculator-amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label={`Monto en ${currency}`} />
          <strong>{currency}</strong>
        </div>
        <div className="calculator-result-label">Recibes en bolívares</div>
        <div className="calculator-result"><span className="result-symbol">Bs</span><strong>{money(result)}</strong><small>VES</small></div>
        <div className="calculator-insights">
          <article className="calculator-insight insight-usdt"><div><span><TrendingUp size={13} /> Extra con USDT P2P</span><strong>+Bs. {money(extraUsdt)}</strong></div><small>+{money(usdt.buy - usd.buy)} por unidad · +{usdtSpread.toFixed(2)}%</small></article>
          <article className="calculator-insight insight-eur"><div><span><TrendingUp size={13} /> Extra con Euro BCV</span><strong>+Bs. {money(extraEur)}</strong></div><small>+{money(eur.buy - usd.buy)} por unidad vs USD BCV</small></article>
        </div>
        <div className="calculator-foot"><span><CheckCircle2 size={14} /> Tasas referenciales verificadas</span><span><Clock3 size={14} /> {loading ? "Actualizando" : `Actualizado ${updatedAt}`}</span></div>
      </div>
    </section>
  );
}
