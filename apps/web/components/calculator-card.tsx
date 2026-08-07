"use client";

import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Bitcoin,
  Calculator,
  CheckCircle2,
  Clock3,
  DollarSign,
  Euro,
  Landmark,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MobilePaymentModal } from "./mobile-payment-modal";

type Currency = "USD" | "EUR" | "USDT";
type Direction = "to-ves" | "from-ves";
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

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const displayRate = (rate?: Rate) => (rate ? money(rate.buy) : "No disponible");

const currencyMeta: Record<Currency, CurrencyMeta> = {
  USD: { Icon: DollarSign, provider: "BCV" },
  EUR: { Icon: Euro, provider: "BCV" },
  USDT: { Icon: Bitcoin, provider: "Binance" },
};

export function CalculatorCard({ compact = false }: { compact?: boolean }) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [direction, setDirection] = useState<Direction>("to-ves");
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/rates`)
      .then((response) => (response.ok ? (response.json() as Promise<Rate[]>) : Promise.reject()))
      .then((data) => { if (data.length) setRates(data); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const usd = useMemo(() => rates.find((rate) => rate.pair === "USD/VES" && rate.provider === "BCV") ?? rates.find((rate) => rate.pair === "USD/VES"), [rates]);
  const usdt = useMemo(() => rates.find((rate) => rate.pair === "USDT/VES" && rate.provider === "BINANCE_P2P") ?? rates.find((rate) => rate.pair === "USDT/VES"), [rates]);
  const eur = useMemo(() => rates.find((rate) => rate.pair === "EUR/VES" && rate.provider === "BCV") ?? rates.find((rate) => rate.pair === "EUR/VES"), [rates]);
  const ratesByCurrency: Record<Currency, Rate | undefined> = { USD: usd, EUR: eur, USDT: usdt };
  const selectedRate = ratesByCurrency[currency];
  const SelectedIcon = currencyMeta[currency].Icon;
  const inputCurrency = direction === "to-ves" ? currency : "VES";
  const outputCurrency = direction === "to-ves" ? "VES" : currency;
  const InputIcon = direction === "to-ves" ? SelectedIcon : Landmark;
  const OutputIcon = direction === "to-ves" ? Landmark : SelectedIcon;
  const parsedAmount = Number(amount.replace(",", ".") || 0);
  const numericAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const convertedAmount = selectedRate
    ? direction === "to-ves"
      ? numericAmount * selectedRate.buy
      : numericAmount / selectedRate.buy
    : 0;
  const updatedAt = selectedRate
    ? new Date(selectedRate.updatedAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })
    : "No disponible";

  return (
    <section className={`calculator-card ${compact ? "calculator-card-compact" : ""}`} aria-labelledby="calculator-title">
      <header className="calculator-header">
        <div>
          <div className="calculator-title"><span className="calculator-icon"><Calculator size={18} /></span><h2 id="calculator-title">Calculadora</h2></div>
          <div className="calculator-sources">
            <span><Landmark size={12} /> BCV {displayRate(usd)}</span>
            <span><Bitcoin size={12} /> Binance {displayRate(usdt)}</span>
            <span><Euro size={12} /> EUR {displayRate(eur)}</span>
          </div>
        </div>
      </header>
      <div className="calculator-body">
        <div className="calculator-tabs" role="tablist" aria-label="Moneda de conversión">
          {(Object.keys(currencyMeta) as Currency[]).map((item) => {
            const Icon = currencyMeta[item].Icon;
            return <button className={currency === item ? "active" : ""} key={item} type="button" role="tab" aria-selected={currency === item} onClick={() => setCurrency(item)}><Icon size={15} />{item}</button>;
          })}
        </div>
        <div className="calculator-direction" role="group" aria-label="Dirección de conversión">
          <div className="calculator-direction-currency">
            <span>Desde</span>
            <strong><InputIcon size={16} /> {inputCurrency}</strong>
          </div>
          <button
            className="calculator-swap-button"
            type="button"
            aria-label={`Cambiar de ${inputCurrency} a ${outputCurrency}`}
            onClick={() => setDirection((current) => current === "to-ves" ? "from-ves" : "to-ves")}
          >
            <ArrowLeftRight size={20} aria-hidden="true" />
          </button>
          <div className="calculator-direction-currency">
            <span>Hacia</span>
            <strong><OutputIcon size={16} /> {outputCurrency}</strong>
          </div>
        </div>
        <div className="calculator-label-row"><label htmlFor="calculator-amount">Monto en {inputCurrency}</label><span>{currencyMeta[currency].provider} · {currency}/VES</span></div>
        <div className="calculator-input">
          <span className="currency-symbol"><InputIcon size={18} /></span>
          <input id="calculator-amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label={`Monto en ${inputCurrency}`} />
          <strong>{inputCurrency}</strong>
        </div>
        <div className="calculator-primary-result">
          <div className="primary-result-head"><span><InputIcon size={14} /> {inputCurrency} <ArrowLeftRight size={12} /> <OutputIcon size={14} /> {outputCurrency}</span><div className="primary-result-actions"><small>{currencyMeta[currency].provider}</small>{direction === "to-ves" && <button className="payment-trigger" type="button" onClick={() => setPaymentOpen(true)}><Smartphone size={13} /> Pago Móvil</button>}</div></div>
          <div className="primary-result-values">
            <div><small>Tasa</small><strong>{selectedRate ? `Bs. ${money(selectedRate.buy)}` : "No disponible"}</strong>{selectedRate && <em>/ {currency}</em>}</div>
            <div className="primary-result-total"><small>Recibes en {outputCurrency} · {amount || "0"} {inputCurrency}</small><strong>{selectedRate ? outputCurrency === "VES" ? `Bs. ${money(convertedAmount)}` : `${currency} ${money(convertedAmount)}` : "No disponible"}</strong></div>
          </div>
        </div>
        <div className="calculator-result-label">{direction === "to-ves" ? "Compara las otras monedas" : "Equivalente con otras tasas"}</div>
        <div className="calculator-quotes" aria-label="Resultados por moneda">
          {(Object.keys(currencyMeta) as Currency[]).filter((quoteCurrency) => quoteCurrency !== currency).map((quoteCurrency) => {
            const quoteMeta = currencyMeta[quoteCurrency];
            const QuoteIcon = quoteMeta.Icon;
            const quoteRate = ratesByCurrency[quoteCurrency];
            const deltaPerUnit = quoteRate && selectedRate ? quoteRate.buy - selectedRate.buy : 0;
            const deltaTotal = numericAmount * deltaPerUnit;
            const quoteResult = quoteRate ? direction === "to-ves" ? numericAmount * quoteRate.buy : numericAmount / quoteRate.buy : 0;
            const isGain = deltaPerUnit > 0.005;
            const isLoss = deltaPerUnit < -0.005;
            const DeltaIcon = isGain ? ArrowUpRight : ArrowDownRight;
            return (
              <article className={`calculator-quote quote-${quoteCurrency.toLowerCase()}`} key={quoteCurrency}>
                <div className="quote-head"><span><QuoteIcon size={14} /> {quoteCurrency}</span><small>{quoteMeta.provider}</small></div>
                <div className="quote-rate">{quoteRate ? `Bs. ${money(quoteRate.buy)}` : "No disponible"} {quoteRate && <small>/ {quoteCurrency}</small>}</div>
                <div className="quote-total-label">Recibes en {direction === "to-ves" ? "VES" : quoteCurrency}</div>
                <div className="quote-total">{quoteRate ? direction === "to-ves" ? `Bs. ${money(quoteResult)}` : `${quoteCurrency} ${money(quoteResult)}` : "No disponible"}</div>
                {quoteRate && (direction === "to-ves" ? <>
                  <div className={`quote-delta ${isGain ? "gain" : isLoss ? "loss" : "selected-reference"}`}>
                    <DeltaIcon size={13} />
                    {`${isGain ? "Ganas" : "Pierdes"} ${isGain ? "+" : "−"}Bs. ${money(Math.abs(deltaPerUnit))} por unidad`}
                  </div>
                  <small className="quote-delta-total">{isGain ? "+" : "−"}Bs. {money(Math.abs(deltaTotal))} en este monto</small>
                </> : <>
                  <div className="quote-delta selected-reference"><ArrowLeftRight size={13} /> 1 Bs. = {money(1 / quoteRate.buy)} {quoteCurrency}</div>
                  <small className="quote-delta-total">Referencia {quoteMeta.provider}</small>
                </>)}
              </article>
            );
          })}
        </div>
        <div className="calculator-foot"><span><CheckCircle2 size={14} /> {selectedRate ? "Tasas referenciales" : "Tasas no disponibles"}</span><span><Clock3 size={14} /> {loading ? "Actualizando" : `Actualizado ${updatedAt}`}</span></div>
      </div>
      <MobilePaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} currency={currency} amount={amount} vesTotal={numericAmount * (selectedRate?.buy ?? 0)} />
    </section>
  );
}
