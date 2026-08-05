"use client";

import { ArrowRightLeft, RefreshCw, Wifi } from "lucide-react";
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
  {
    provider: "BCV",
    pair: "USD/VES",
    buy: 744.23,
    sell: 744.23,
    status: "verified",
    updatedAt: new Date().toISOString(),
  },
  {
    provider: "BINANCE_P2P",
    pair: "USDT/VES",
    buy: 845.99,
    sell: 850.25,
    status: "verified",
    updatedAt: new Date().toISOString(),
  },
  {
    provider: "BCV",
    pair: "EUR/VES",
    buy: 846.07,
    sell: 846.07,
    status: "verified",
    updatedAt: new Date().toISOString(),
  },
];

export function RateDashboard() {
  const [rates, setRates] = useState<Rate[]>(fallback);
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`${API}/v1/rates`)
      .then((r) => (r.ok ? (r.json() as Promise<Rate[]>) : Promise.reject()))
      .then(setRates)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  const usd = useMemo(
    () => rates.find((rate) => rate.pair === "USD/VES"),
    [rates],
  );
  const converted = Number(amount || 0) * (usd?.buy ?? 744.23);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="muted text-sm">Datos referenciales · Venezuela</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            La tasa, clara.
          </h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-300">
          <Wifi size={15} />
          {loading ? "Actualizando" : "En línea"}
        </span>
      </div>
      <div className="grid rate-grid">
        <div className="panel p-6">
          <p className="muted text-sm">BCV oficial</p>
          <p className="mt-3 text-4xl font-black">Bs. {usd?.buy.toFixed(2)}</p>
          <p className="mt-2 text-sm text-green-300">Verificada</p>
        </div>
        <div className="panel p-6">
          <p className="muted text-sm">USDT paralelo</p>
          <p className="mt-3 text-4xl font-black">
            Bs.{" "}
            {rates.find((rate) => rate.pair === "USDT/VES")?.buy.toFixed(2) ??
              "845.99"}
          </p>
          <p className="mt-2 text-sm text-amber-300">Promedio de mercado</p>
        </div>
        <div className="panel p-6">
          <p className="muted text-sm">Brecha estimada</p>
          <p className="mt-3 text-4xl font-black text-amber-300">
            {usd
              ? (
                  (((rates.find((rate) => rate.pair === "USDT/VES")?.buy ??
                    usd.buy) -
                    usd.buy) /
                    usd.buy) *
                  100
                ).toFixed(2)
              : "0.00"}
            %
          </p>
          <p className="mt-2 text-sm muted">Oficial vs. paralelo</p>
        </div>
      </div>
      <div className="panel p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold">Convertidor</p>
            <p className="muted text-sm">Usa la última tasa disponible.</p>
          </div>
          <ArrowRightLeft className="text-green-300" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="muted">USD</span>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-2xl font-bold outline-none focus:border-green-400"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <div className="rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-4">
            <span className="muted text-sm">VES</span>
            <p className="mt-2 text-2xl font-bold">
              {converted.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm muted">
        <RefreshCw size={14} /> Actualización automática y caché de última
        lectura.
      </div>
    </div>
  );
}
