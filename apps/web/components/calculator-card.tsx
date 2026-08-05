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
  USD: { Icon: DollarSign, provider: "BCV" },
  EUR: { Icon: Euro, provider: "BCV" },
  USDT: { Icon: Bitcoin, provider: "P2P" },
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
  const SelectedIcon = currencyMeta[currency].Icon;
  const numericAmount = Number(amount || 0);
  const updatedAt = new Date(selectedRate.updatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

  return (
    <section className={`calculator-card ${compact ? "calculator-card-compact" : ""}`} aria-labelledby="calculator-title">
      <header className="calculator-header">
        <div>
          <div className="calculator-title"><span className="calculator-icon"><Calculator size={18} /></span><h2 id="calculator-title">Calculadora</h2></div>
          <div className="calculator-sources">
            <span><Landmark size={12} /> BCV {money(usd.buy)}</span>
            <span><Bitcoin size={12} /> P2P {money(usdt.buy)}</span>
            <span><Euro size={12} /> EUR {money(eur.buy)}</span>
          </div>
        </div>
      </header>
      <div className="calculator-body">
        <div className="calculator-tabs" role="tablist" aria-label="Moneda base">
          {(Object.keys(currencyMeta) as Currency[]).map((item) => {
            const Icon = currencyMeta[item].Icon;
            return <button className={currency === item ? "active" : ""} key={item} type="button" role="tab" aria-selected={currency === item} onClick={() => setCurrency(item)}><Icon size={15} />{item}</button>;
          })}
        </div>
        <div className="calculator-label-row"><label htmlFor="calculator-amount">Monto base</label><span>{currencyMeta[currency].provider} · {currency}/VES</span></div>
        <div className="calculator-input">
          <span className="currency-symbol"><SelectedIcon size={18} /></span>
          <input id="calculator-amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label={`Monto en ${currency}`} />
          <strong>{currency}</strong>
        </div>
        <div className="calculator-primary-result">
          <div className="primary-result-head"><span><SelectedIcon size={14} /> {currency} · {currencyMeta[currency].provider}</span><small>Tasa base</small></div>
          <div className="primary-result-values">
            <div><small>Tasa</small><strong>Bs. {money(selectedRate.buy)}</strong><em>/ {currency}</em></div>
            <div className="primary-result-total"><small>Recibes en VES · {amount || "0"} {currency}</small><strong>Bs. {money(numericAmount * selectedRate.buy)}</strong></div>
          </div>
        </div>
        <div className="calculator-result-label">Compara las otras monedas</div>
        <div className="calculator-quotes" aria-label="Resultados por moneda">
          {(Object.keys(currencyMeta) as Currency[]).filter((quoteCurrency) => quoteCurrency !== currency).map((quoteCurrency) => {
            const quoteMeta = currencyMeta[quoteCurrency];
            const QuoteIcon = quoteMeta.Icon;
            const quoteRate = ratesByCurrency[quoteCurrency];
            const deltaPerUnit = quoteRate.buy - selectedRate.buy;
            const deltaTotal = numericAmount * deltaPerUnit;
            const isGain = deltaPerUnit > 0.005;
            const isLoss = deltaPerUnit < -0.005;
            const DeltaIcon = isGain ? ArrowUpRight : ArrowDownRight;
            return (
              <article className={`calculator-quote quote-${quoteCurrency.toLowerCase()}`} key={quoteCurrency}>
                <div className="quote-head"><span><QuoteIcon size={14} /> {quoteCurrency}</span><small>{quoteMeta.provider}</small></div>
                <div className="quote-rate">Bs. {money(quoteRate.buy)} <small>/ {quoteCurrency}</small></div>
                <div className="quote-total-label">Recibes en VES</div>
                <div className="quote-total">Bs. {money(numericAmount * quoteRate.buy)}</div>
                <div className={`quote-delta ${isGain ? "gain" : isLoss ? "loss" : "selected-reference"}`}>
                  <DeltaIcon size={13} />
                  {`${isGain ? "Ganas" : "Pierdes"} ${isGain ? "+" : "−"}Bs. ${money(Math.abs(deltaPerUnit))} por unidad`}
                </div>
                <small className="quote-delta-total">{isGain ? "+" : "−"}Bs. {money(Math.abs(deltaTotal))} en este monto</small>
              </article>
            );
          })}
        </div>
        <div className="calculator-foot"><span><CheckCircle2 size={14} /> Tasas referenciales</span><span><Clock3 size={14} /> {loading ? "Actualizando" : `Actualizado ${updatedAt}`}</span></div>
      </div>
    </section>
  );
}
