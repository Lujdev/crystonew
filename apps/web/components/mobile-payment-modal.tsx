"use client";

import { Check, Copy, IdCard, Landmark, Phone, Smartphone, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import banks from "../data/venezuelan-banks.json";

type Currency = "USD" | "EUR" | "USDT";
type DocumentType = "V" | "J" | "E";
type Props = {
  open: boolean;
  onClose: () => void;
  currency: Currency;
  amount: string;
  vesTotal: number;
};

const money = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clipboardMoney = (value: number) => value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const documentPattern = /^\d{6,10}$/;
const phonePattern = /^04\d{9}$/;

export function MobilePaymentModal({ open, onClose, currency, amount, vesTotal }: Props) {
  const [documentType, setDocumentType] = useState<DocumentType>("V");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const selectedBank = useMemo(() => banks.find((bank) => bank.code === bankCode), [bankCode]);
  const clipboardText = `${documentType}${documentNumber.trim()}\n${phone.trim()}\n${bankCode} ${selectedBank?.name ?? ""}\n${clipboardMoney(vesTotal)} Bs`;

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    setError("");
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const handleCopy = async () => {
    if (!documentPattern.test(documentNumber.trim())) {
      setError("Coloca solo el número de Cédula o RIF, entre 6 y 10 dígitos.");
      return;
    }
    if (!phonePattern.test(phone.trim())) {
      setError("Coloca un teléfono venezolano válido de 11 dígitos, por ejemplo 04241914580.");
      return;
    }
    if (!selectedBank) {
      setError("Selecciona el banco receptor.");
      return;
    }

    try {
      await navigator.clipboard.writeText(clipboardText);
      setError("");
      setCopied(true);
    } catch {
      setError("No pudimos acceder al portapapeles. Revisa los permisos del navegador e inténtalo de nuevo.");
    }
  };

  const modal = (
    <div className="payment-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <header className="payment-modal-head">
          <div>
            <span className="payment-kicker"><Smartphone size={14} /> Pago Móvil</span>
            <h2 id="payment-title">Copia tu pago</h2>
            <p>Completa el receptor y pega estos datos directamente en tu banco.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar Pago Móvil"><X size={18} /></button>
        </header>
        <div className="payment-summary">
          <div><span>Monto base</span><strong>{amount || "0"} {currency}</strong></div>
          <div><span>Total a pagar</span><strong>Bs. {money(vesTotal)}</strong></div>
        </div>
        <div className="payment-form">
          <label className="payment-field">
            <span><IdCard size={14} /> Cédula/RIF</span>
            <div className="payment-document-row">
              <select aria-label="Tipo de documento" value={documentType} onChange={(event) => setDocumentType(event.target.value as DocumentType)}>
                <option value="V">V</option>
                <option value="J">J</option>
                <option value="E">E</option>
              </select>
              <input aria-label="Número de Cédula o RIF" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="22035450" inputMode="numeric" autoComplete="off" />
            </div>
          </label>
          <label className="payment-field"><span><Phone size={14} /> Teléfono</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="04241914580" inputMode="tel" autoComplete="tel" /></label>
          <label className="payment-field"><span><Landmark size={14} /> Banco receptor</span><select value={bankCode} onChange={(event) => setBankCode(event.target.value)}><option value="">Selecciona un banco</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.code} · {bank.name}</option>)}</select></label>
          {error && <p className="payment-error" role="alert">{error}</p>}
          <p className="payment-note"><Copy size={14} /> Al copiar tendrás 4 líneas listas para pegar en tu banco.</p>
          <button className="button button-primary form-submit" type="button" onClick={handleCopy}>{copied ? <><Check size={16} /> Copiado al portapapeles</> : <><Copy size={16} /> Copiar datos</>}</button>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}
