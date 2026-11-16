"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  adultsCount,
  childrenCount,
  daysBetween,
  searchDemoDestinations,
} from "./lib/travel-demo";
import type { Traveler, TripOption } from "./lib/travel-demo";
import { trackBookingClick } from "./components/analytics-consent";

type SearchResponse = {
  mode: "demo" | "booking";
  message: string;
  options: TripOption[];
  summary: {
    nights: number;
    travelers: number;
    travelerWeight: number;
  };
  error?: string;
};

const tripStarts = [
  "A Coruña", "Albacete", "Alicante", "Almería", "Álava", "Asturias", "Ávila", "Badajoz",
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
  "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca",
  "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid",
  "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca",
  "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
  "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza",
];
const searchStorageKey = "budgoLastSearch";
const searchStorageLifetime = 2 * 60 * 60 * 1000;

const serviceOptions = [
  { key: "flights", label: "Vuelos" },
  { key: "carRental", label: "Coche" },
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

const today = new Date();
const defaultStart = new Date(today);
const defaultEnd = new Date(today);

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function toIsoDate(displayDate: string) {
  const match = displayDate.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const candidate = new Date(`${year}-${month}-${day}T00:00:00`);
  if (
    candidate.getFullYear() !== Number(year) ||
    candidate.getMonth() + 1 !== Number(month) ||
    candidate.getDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-[76px] flex-col justify-center rounded-xl bg-slate-50 px-4 py-3 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#18C4C7]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function DateField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const isoValue = toIsoDate(value) ?? "";

  return (
    <div className="relative min-w-0">
      <input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-2 pr-8 text-sm font-bold outline-[#18C4C7]"
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 flex w-8 items-center justify-center text-slate-600">📅</span>
      <input
        type="date"
        value={isoValue}
        onChange={(event) => onChange(toDisplayDate(event.target.value))}
        aria-label={`Abrir calendario: ${label}`}
        className="absolute inset-y-0 right-0 h-full w-8 cursor-pointer opacity-0"
      />
    </div>
  );
}

export default function Home() {
  const [budget, setBudget] = useState(0);
  const [startDateText, setStartDateText] = useState(toDisplayDate(toDateInput(defaultStart)));
  const [endDateText, setEndDateText] = useState(toDisplayDate(toDateInput(defaultEnd)));
  const [tripStart, setTripStart] = useState("");
  const [includeServices, setIncludeServices] = useState({
    flights: false,
    carRental: false,
  });
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [occupancyOpen, setOccupancyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const startDate = toIsoDate(startDateText);
  const endDate = toIsoDate(endDateText);

  const requestPayload = useMemo(
    () => ({
      budget,
      startDate: startDate ?? "",
      endDate: endDate ?? "",
      tripStart,
      includeServices,
      travelers,
    }),
    [budget, endDate, includeServices, startDate, travelers, tripStart],
  );

  const fallbackOptions = useMemo(
    () => searchDemoDestinations(requestPayload),
    [requestPayload],
  );

  const options = response?.options ?? fallbackOptions;
  const nights = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const adults = adultsCount(travelers);
  const children = childrenCount(travelers);
  const topOption = options[0];
  const activeExtras = serviceOptions.filter((service) => includeServices[service.key]);

  useEffect(() => {
    const saved = localStorage.getItem(searchStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { savedAt?: number } & typeof requestPayload;
      if (!parsed.savedAt || Date.now() - parsed.savedAt > searchStorageLifetime) {
        localStorage.removeItem(searchStorageKey);
        return;
      }
      if (!parsed.tripStart || !parsed.startDate || !parsed.endDate || !parsed.travelers?.length || parsed.budget <= 0) return;

      setBudget(parsed.budget);
      setStartDateText(toDisplayDate(parsed.startDate));
      setEndDateText(toDisplayDate(parsed.endDate));
      setTripStart(parsed.tripStart);
      setIncludeServices(parsed.includeServices);
      setTravelers(parsed.travelers);
      setHasSearched(true);
    } catch {
      localStorage.removeItem(searchStorageKey);
    }
  }, []);

  function setOccupancy(adultTotal: number, childAges: number[]) {
    const adultsToUse = Math.max(0, Math.min(8, adultTotal));
    const childrenToUse = childAges.slice(0, 6);
    setTravelers([
      ...Array.from({ length: adultsToUse }, (_, index) => ({ id: index + 1, age: 30 })),
      ...childrenToUse.map((age, index) => ({ id: adultsToUse + index + 1, age })),
    ]);
  }

  function changeAdults(change: number) {
    setOccupancy(adults + change, travelers.filter((traveler) => traveler.age < 18).map((traveler) => traveler.age));
  }

  function changeChildren(change: number) {
    const ages = travelers.filter((traveler) => traveler.age < 18).map((traveler) => traveler.age);
    if (change > 0 && ages.length < 6) ages.push(8);
    if (change < 0) ages.pop();
    setOccupancy(adults, ages);
  }

  function updateChildAge(id: number, age: number) {
    setTravelers((current) => current.map((traveler) => traveler.id === id ? { ...traveler, age } : traveler));
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tripStart || budget <= 0 || travelers.length === 0 || !startDate || !endDate) {
      setError("Selecciona el origen, un presupuesto, las fechas y al menos un viajero.");
      return;
    }
    localStorage.setItem(searchStorageKey, JSON.stringify({ ...requestPayload, savedAt: Date.now() }));
    setHasSearched(true);
    setIsLoading(true);
    setError("");

    try {
      const apiResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });
      const data = (await apiResponse.json()) as SearchResponse;

      if (!apiResponse.ok) {
        throw new Error(data.error ?? "No se pudo completar la busqueda");
      }

      setResponse(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo completar la busqueda");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F8FA] text-slate-900">
      <section className="bg-[#0156A6] px-4 pb-10 pt-5 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="grid items-center gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-md bg-white p-4 shadow-lg shadow-slate-950/15">
              <img
                src="/budgo-logo.png"
                alt="Budgo"
                className="h-28 w-full object-contain"
              />
            </div>
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white/85">
                Tu presupuesto marca el camino
              </div>
              <p className="text-2xl font-bold leading-tight text-white/95 sm:text-4xl">
                Dinos cuanto quieres gastar y Budgo encuentra el viaje que encaja contigo.
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/75 sm:text-lg">
                Planifica escapadas en España y Portugal según tu presupuesto. Compara opciones y confirma la disponibilidad final con el proveedor de reserva.
              </p>
            </div>
          </header>
        </div>
      </section>

      <section className="-mt-7 px-4 sm:px-8 lg:px-12">
        <form
          onSubmit={submitSearch}
          className="mx-auto grid max-w-7xl gap-2 rounded-2xl border border-[#18C4C7]/75 bg-white/95 p-2 shadow-xl md:grid-cols-[1.12fr_.95fr_1.42fr_1.08fr_158px]"
        >
          <FieldShell label="Desde dónde viajas">
            <select
              value={tripStart}
              onChange={(event) => setTripStart(event.target.value)}
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            >
              <option value="">Selecciona provincia</option>
              {tripStarts.map((start) => (
                <option key={start}>{start}</option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="Presupuesto">
            <input
              type="number"
              min={0}
              step={50}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            />
          </FieldShell>

          <FieldShell label="Fechas del viaje">
            <div className="mt-1 grid grid-cols-2 gap-2">
              <DateField
                value={startDateText}
                onChange={setStartDateText}
                label="Fecha de inicio, formato día mes año"
              />
              <DateField
                value={endDateText}
                onChange={setEndDateText}
                label="Fecha de vuelta, formato día mes año"
              />
            </div>
          </FieldShell>

          <FieldShell label="Ocupación">
            <div className="relative mt-1">
              <button type="button" onClick={() => setOccupancyOpen((current) => !current)} className="flex w-full items-center justify-between text-left text-lg font-bold">
                <span>{adults} adultos · {children} niños</span>
                <span className="text-sm text-[#0156A6]">Editar</span>
              </button>
              {occupancyOpen ? (
                <div className="absolute right-0 top-9 z-30 w-[320px] rounded-xl border border-slate-300 bg-white p-4 shadow-2xl">
                  <div className="flex items-center justify-between py-2"><strong>Adultos</strong><div className="flex items-center gap-3"><button type="button" onClick={() => changeAdults(-1)} className="h-9 w-9 rounded-full border border-[#18C4C7] text-xl font-bold text-[#0156A6]">−</button><strong>{adults}</strong><button type="button" onClick={() => changeAdults(1)} className="h-9 w-9 rounded-full border border-[#18C4C7] text-xl font-bold text-[#0156A6]">+</button></div></div>
                  <div className="flex items-center justify-between py-2"><strong>Niños</strong><div className="flex items-center gap-3"><button type="button" onClick={() => changeChildren(-1)} className="h-9 w-9 rounded-full border border-[#18C4C7] text-xl font-bold text-[#0156A6]">−</button><strong>{children}</strong><button type="button" onClick={() => changeChildren(1)} className="h-9 w-9 rounded-full border border-[#18C4C7] text-xl font-bold text-[#0156A6]">+</button></div></div>
                  {travelers.filter((traveler) => traveler.age < 18).map((traveler, index) => (
                    <label key={traveler.id} className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-semibold">Niño {index + 1}<select value={traveler.age} onChange={(event) => updateChildAge(traveler.id, Number(event.target.value))} className="rounded-md border border-slate-300 p-2">{Array.from({ length: 18 }, (_, age) => <option key={age} value={age}>{age} años</option>)}</select></label>
                  ))}
                </div>
              ) : null}
            </div>
          </FieldShell>

          <button
            type="submit"
            className="min-h-[76px] rounded-xl bg-[#0076E8] px-6 text-xl font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#01408D]"
          >
            {isLoading ? "Buscando" : "Buscar"}
          </button>
        </form>
      </section>

      <section className="px-4 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Viajeros</h2>
            <p className="mt-1 text-sm text-slate-500">Usa «Editar» en Ocupación para elegir adultos, niños y sus edades.</p>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <strong>{adults} adultos · {children} niños</strong>
              {children > 0 ? <div className="mt-1">Edades: {travelers.filter((traveler) => traveler.age < 18).map((traveler) => traveler.age).join(", ")}</div> : null}
            </div>

            <div className="mt-5 rounded-md bg-[#EAFBFB] p-4 text-sm text-slate-700">
              {response?.message ??
                "Por defecto se calcula solo alojamiento. Activa extras si quieres sumar vuelos o coche."}
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Extras opcionales
              </h3>
              <div className="mt-3 grid gap-2">
                {serviceOptions.map((service) => (
                  <label
                    key={service.key}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-3"
                  >
                    <span className="font-semibold">{service.label}</span>
                    <input
                      type="checkbox"
                      checked={includeServices[service.key]}
                      onChange={(event) =>
                        setIncludeServices((current) => ({
                          ...current,
                          [service.key]: event.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-[#18C4C7]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Alojamientos dentro de tu presupuesto</h2>
                <p className="text-sm text-slate-500">
                  {response?.mode === "booking" ? "Precios recibidos de Booking" : "Estimaciones de alojamiento"}
                  {activeExtras.length > 0
                    ? ` + ${activeExtras.map((service) => service.label.toLowerCase()).join(", ")}`
                    : ""}{" "}
                  ordenado de menor a mayor.
                </p>
              </div>
              {topOption ? (
                <div className="rounded-md bg-white px-4 py-3 text-sm shadow-sm">
                  {response?.mode === "booking" ? "Opción más económica" : "Estimación más baja"}: <strong>{topOption.name}</strong> · {formatCurrency(topOption.total)}
                </div>
              ) : null}
            </div>

            <div className="mb-4 rounded-md border border-[#18C4C7]/40 bg-[#EAFBFB] px-4 py-3 text-sm leading-relaxed text-slate-700">
              <strong>Información importante:</strong> {response?.mode === "booking"
                ? "el importe y la disponibilidad pueden variar hasta que los confirmes en Booking.com."
                : "estas propuestas son orientativas. Confirma siempre el precio final, impuestos, disponibilidad y condiciones en Booking.com."}
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            ) : null}

            {!hasSearched ? (
              <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold">Completa tu búsqueda</h3>
                <p className="mt-2 text-slate-500">Indica origen, presupuesto, fechas y viajeros para ver alojamientos.</p>
              </div>
            ) : options.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold">No hay destinos dentro del presupuesto</h3>
                <p className="mt-2 text-slate-500">
                  Sube el importe, reduce noches o prueba otro tipo de destino.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {options.map((option, index) => {
                  const percent = Math.min(100, Math.round((option.total / budget) * 100));
                  const key = `${option.id}-${option.accommodationName}-${index}`;

                  return (
                    <article
                      key={key}
                      className="grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm md:grid-cols-[250px_1fr]"
                    >
                      <img
                        src={option.image}
                        alt={`${option.name}, ${option.country}`}
                        className="h-56 w-full object-cover md:h-full"
                      />
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-[#0156A6]">
                              #{index + 1} · Alojamiento ·{" "}
                              {option.source === "booking" ? "Precio de Booking" : "Estimación"}
                            </div>
                            <h3 className="mt-1 text-2xl font-bold">
                              {option.accommodationName}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {option.name}, {option.country} · {option.climate}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-[#0156A6]">
                              {formatCurrency(option.total)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {formatCurrency(option.perPerson)} por persona
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-md bg-slate-50 p-4">
                          <div className="flex flex-wrap justify-between gap-2">
                            <div>
                              <p className="font-bold">{option.accommodationCategory}</p>
                              <p className="text-sm text-slate-500">
                                {option.board} ·{" "}
                                {formatCurrency(option.nightlyPrice)}/noche
                              </p>
                            </div>
                            <div className="text-sm font-bold text-emerald-700">
                              Sobran {formatCurrency(Math.max(0, option.remaining))}
                            </div>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#18C4C7]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          {[
                            ["Vuelos", option.breakdown.flights],
                            ["Alojamiento", option.breakdown.accommodation],
                            ["Coche", option.breakdown.carRental],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-md border border-slate-200 px-3 py-2">
                              <div className="text-xs text-slate-500">{label}</div>
                              <div className="font-bold">{formatCurrency(Number(value))}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm text-slate-500">
                            {nights} noches desde {tripStart} para {travelers.length} personas
                          </span>
                          <div className="flex flex-col items-end gap-1">
                            <a
                              href={option.bookingUrl}
                              target="_blank"
                              rel="noopener sponsored"
                              onClick={() => trackBookingClick(option.bookingUrl)}
                              className="rounded-md bg-[#0156A6] px-4 py-3 font-bold text-white hover:bg-[#01408D]"
                            >
                              Consultar en Booking.com
                            </a>
                            <span className="text-xs text-slate-500">Enlace afiliado · precio y disponibilidad finales en Booking</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="bg-[#0156A6] px-4 py-8 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-2xl font-bold">budgo.es</p>
              <p className="mt-1 text-sm text-white/75">
                Tu presupuesto marca el camino.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Información y enlaces legales">
              <a className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" href="/sobre-budgo.html">
                Sobre Budgo
              </a>
              <a className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" href="mailto:budgoviajes@gmail.com">
                Contacto
              </a>
              <a className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" href="/aviso-legal.html">
                Aviso legal
              </a>
              <a className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" href="/politica-privacidad.html">
                Politica de privacidad
              </a>
              <a className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20" href="/politica-cookies.html">
                Politica de cookies
              </a>
            </nav>
          </div>
          <p className="mt-6 max-w-4xl border-t border-white/20 pt-5 text-sm leading-relaxed text-white/75">
            Transparencia: Budgo puede recibir una comisión si reservas a través de algunos enlaces, sin coste adicional para ti. Los precios, la disponibilidad y las condiciones definitivas se confirman siempre en la plataforma de reserva.
          </p>
        </div>
      </footer>
    </main>
  );
}
