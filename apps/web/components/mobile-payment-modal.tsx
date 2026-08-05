"use client";

import { CreditCard, IdCard, Landmark, Phone, ShieldCheck, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import banks from "../data/venezuelan-banks.json";

type Currency = "USD" | "EUR" | "USDT";
type Props = {
  open: boolean;
  onClose: () => void;
  currency: Currency;
  amount: string;
  vesTotal: number;
};

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const documentPattern = /^[VEJGPC]-?\d{6,10}$/i;
const phonePattern = /^04\d{2}-?\d{7}$/;

export function MobilePaymentModal({ open, onClose, currency, amount, vesTotal }: Props) {
  const [documentId, setDocumentId] = useState("");
  const [phone, setPhone] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setError("");
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!documentPattern.test(documentId.trim())) { setError("Usa una Cédula o RIF como V-12345678 o J-123456789."); return; }
    if (!phonePattern.test(phone.trim())) { setError("Usa un teléfono venezolano válido, por ejemplo 0412-1234567."); return; }
    if (!bankCode) { setError("Selecciona el banco receptor."); return; }
    setError("");
    setSubmitted(true);
  };

  return (
    <div className="payment-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <header className="payment-modal-head">
          <div><span className="payment-kicker"><Smartphone size={14} /> Pago Móvil</span><h2 id="payment-title">Prepara tu pago</h2><p>Completa los datos del receptor para dejar la operación lista.</p></div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar Pago Móvil"><X size={18} /></button>
        </header>
        <div className="payment-summary"><div><span>Monto base</span><strong>{amount || "0"} {currency}</strong></div><div><span>Total a pagar</span><strong>Bs. {money(vesTotal)}</strong></div></div>
        {submitted ? (
          <div className="payment-success"><ShieldCheck size={24} /><h3>Datos listos</h3><p>La operación está preparada para {amount || "0"} {currency} por Bs. {money(vesTotal)}. En el siguiente paso podrás conectarla con tu proveedor de pagos.</p><button className="button button-primary form-submit" type="button" onClick={onClose}>Cerrar</button></div>
        ) : (
          <form className="payment-form" onSubmit={handleSubmit}>
            <label className="payment-field"><span><IdCard size={14} /> Cédula o RIF</span><input value={documentId} onChange={(event) => setDocumentId(event.target.value.toUpperCase())} placeholder="V-12345678 o J-123456789" autoComplete="off" /></label>
            <label className="payment-field"><span><Phone size={14} /> Teléfono</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^\d-]/g, ""))} placeholder="0412-1234567" inputMode="tel" autoComplete="tel" /></label>
            <label className="payment-field"><span><Landmark size={14} /> Banco receptor</span><select value={bankCode} onChange={(event) => setBankCode(event.target.value)}><option value="">Selecciona un banco</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.code} · {bank.name}</option>)}</select></label>
            {error && <p className="payment-error" role="alert">{error}</p>}
            <p className="payment-note"><CreditCard size={14} /> No enviamos estos datos todavía; este MVP solo prepara la operación localmente.</p>
            <button className="button button-primary form-submit" type="submit">Generar datos de Pago Móvil</button>
          </form>
        )}
      </section>
    </div>
  );
}
