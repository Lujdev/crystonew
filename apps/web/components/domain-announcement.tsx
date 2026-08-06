"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "crystodolar-domain-announcement-dismissed";

export function DomainAnnouncement() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "true") {
        setIsVisible(false);
      }
    } catch {
      // If storage is unavailable, the announcement remains visible.
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Dismissing the current view still works without storage.
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="domain-announcement"
      aria-label="Aviso sobre el nuevo dominio"
    >
      <div className="container domain-announcement-inner">
        <p className="domain-announcement-copy">
          <strong>Nuevo dominio:</strong>
          <span>ahora estamos en</span>
          <a
            className="domain-announcement-link"
            href="https://crystodolar.xyz/"
            target="_blank"
            rel="noreferrer noopener"
          >
            https://crystodolar.xyz/
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </p>
        <button
          className="domain-announcement-dismiss"
          type="button"
          onClick={dismiss}
          aria-label="Cerrar aviso"
          title="Cerrar aviso"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
