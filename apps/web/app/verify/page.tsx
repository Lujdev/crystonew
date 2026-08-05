"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [message, setMessage] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;
    fetch(`${API}/v1/developers/verify?token=${encodeURIComponent(token)}`)
      .then((response) => {
        if (!response.ok) throw new Error("invalid-link");
        return response.json() as Promise<{
          apiKey: string;
          plan: string;
          monthlyLimit: number;
        }>;
      })
      .then((data) => {
        setApiKey(data.apiKey);
        setMessage(
          `Clave ${data.plan} creada con ${data.monthlyLimit.toLocaleString("es-VE")} peticiones mensuales. Guárdala ahora: solo se muestra una vez.`,
        );
      })
      .catch(() => setMessage("El magic link es inválido o ya fue utilizado."));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`${API}/v1/developers/magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, plan }),
    });
    const data = (await response.json()) as { previewUrl?: string };
    setMessage(
      data.previewUrl
        ? `En desarrollo: ${data.previewUrl}`
        : "Revisa tu correo para continuar.",
    );
  };
  return (
    <main className="container py-20">
      <div className="panel mx-auto max-w-lg p-8">
        <p className="text-sm font-bold uppercase tracking-[.25em] text-green-300">
          API keys
        </p>
        <h1 className="mt-4 text-3xl font-black">Confirma tu correo</h1>
        <p className="mt-3 muted">
          Te enviaremos un magic link para crear y administrar tu clave.
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-4">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 outline-none focus:border-green-400"
          />
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 outline-none focus:border-green-400"
          >
            <option value="free">Free · 500 solicitudes/mes</option>
            <option value="development">
              Development · 10.000 solicitudes/mes
            </option>
          </select>
          <button className="button button-primary" type="submit">
            Enviar magic link
          </button>
        </form>
        {message && (
          <p className="mt-5 break-all text-sm text-green-300">{message}</p>
        )}
        {apiKey && (
          <code className="mt-4 block rounded-xl border border-green-400/30 bg-slate-950 p-4 text-sm text-green-200">
            {apiKey}
          </code>
        )}
      </div>
    </main>
  );
}
