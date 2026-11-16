"use client";

import { useEffect, useState } from "react";

const measurementId = "G-39J99RZ6YZ";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    budgoAnalyticsLoaded?: boolean;
  }
}

function loadAnalytics() {
  if (window.budgoAnalyticsLoaded) return;
  window.budgoAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackBookingClick(url: string) {
  window.gtag?.("event", "booking_click", { link_url: url });
}

export default function AnalyticsConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("budgoAnalyticsConsent");
    if (consent === "accepted") loadAnalytics();
    else if (!consent) setShowBanner(true);
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    localStorage.setItem("budgoAnalyticsConsent", value);
    setShowBanner(false);
    if (value === "accepted") loadAnalytics();
  };

  if (!showBanner) return null;

  return (
    <aside className="fixed bottom-3 right-3 z-50 max-w-[510px] rounded-xl border border-slate-300 bg-white p-5 shadow-2xl max-sm:left-3" role="dialog" aria-label="Preferencias de cookies">
      <h2 className="text-lg font-bold">Tu privacidad en Budgo</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Usamos analítica opcional para entender las visitas y mejorar Budgo. Puedes aceptar o continuar solo con las cookies necesarias.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => choose("accepted")} className="rounded-lg bg-[#0156A6] px-4 py-2.5 font-bold text-white">Aceptar analítica</button>
        <button type="button" onClick={() => choose("rejected")} className="rounded-lg bg-slate-200 px-4 py-2.5 font-bold text-slate-800">Solo necesarias</button>
        <a className="text-sm font-semibold text-[#0156A6] underline" href="/politica-cookies.html">Ver política de cookies</a>
      </div>
    </aside>
  );
}
