"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "../../components/header";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;
    fetch(`${API}/v1/developers/verify?token=${encodeURIComponent(token)}`)
      .then((response) => {
        if (!response.ok) throw new Error("invalid-link");
        return response.json() as Promise<{
          apiKey: string;
          monthlyLimit: number;
        }>;
      })
      .then((data) => {
        setApiKey(data.apiKey);
        setMessage(
          `Tu API key Free está lista con ${data.monthlyLimit.toLocaleString("es-VE")} solicitudes mensuales. Guárdala ahora: solo se muestra una vez.`,
        );
      })
      .catch(() =>
        setMessage("Este magic link no es válido o ya fue utilizado."),
      );
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/v1/developers/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("request-failed");
      const data = (await response.json()) as { previewUrl?: string };
      setMessage(
        data.previewUrl
          ? `En desarrollo puedes abrir este enlace: ${data.previewUrl}`
          : "Listo. Revisa tu correo para continuar con tu API key Free.",
      );
    } catch {
      setMessage(
        "No pudimos enviar el enlace. Verifica el correo e inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <Header />
      <main className="container verify-page">
        <div className="verify-layout">
          <section className="verify-copy">
            <Link className="button button-ghost" href="/docs">
              <ArrowLeft size={15} /> Volver a documentación
            </Link>
            <p className="eyebrow" style={{ marginTop: 44 }}>
              Acceso de desarrolladores
            </p>
            <h1>
              Una clave para <em>empezar.</em>
            </h1>
            <p>
              Te enviamos un enlace seguro para confirmar tu correo y crear tu
              API key Free. Sin contraseñas, sin formularios largos.
            </p>
            <div className="verify-points">
              <span>
                <CheckCircle2 size={17} color="var(--lime)" /> 500 solicitudes
                mensuales incluidas
              </span>
              <span>
                <ShieldCheck size={17} color="var(--brand)" /> La clave se
                guarda como hash
              </span>
              <span>
                <Mail size={17} color="var(--coral)" /> Magic link válido por 15
                minutos
              </span>
            </div>
          </section>

          <section className="panel verify-card">
            <p className="eyebrow">API key Free</p>
            <h2>Confirma tu correo</h2>
            <p>
              Te enviaremos un magic link para activar tus 500 solicitudes
              mensuales.
            </p>
            <form onSubmit={submit} className="form-stack">
              <label className="form-label" htmlFor="developer-email">
                Correo electrónico
                <input
                  id="developer-email"
                  className="form-input"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </label>
              <div
                className="card"
                style={{
                  padding: "14px 15px",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                }}
              >
                <span
                  className="feature-icon"
                  style={{ width: 34, height: 34, flexShrink: 0 }}
                >
                  <Check size={16} />
                </span>
                <div>
                  <strong style={{ display: "block", fontSize: "0.85rem" }}>
                    Plan Free
                  </strong>
                  <span className="muted" style={{ fontSize: "0.76rem" }}>
                    500 solicitudes / mes · siempre gratis
                  </span>
                </div>
              </div>
              <button
                className="button button-primary form-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Enviando…" : "Enviar magic link"}
              </button>
            </form>
            {message && (
              <p className="form-message" style={{ marginTop: 17 }}>
                {message}
              </p>
            )}
            {apiKey && <code className="api-key-output">{apiKey}</code>}
          </section>
        </div>
      </main>
    </div>
  );
}
