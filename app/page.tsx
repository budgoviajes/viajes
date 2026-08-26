"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  adultsCount,
  childrenCount,
  daysBetween,
  searchDemoDestinations,
} from "./lib/travel-demo";
import type { DestinationType, Traveler, TripOption } from "./lib/travel-demo";

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

const destinationTypes: Array<DestinationType | "Todos"> = [
  "Todos",
  "Costa",
  "Montaña",
  "Ciudad",
  "Nieve",
];

const tripStarts = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"];

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
defaultStart.setDate(today.getDate() + 35);
const defaultEnd = new Date(defaultStart);
defaultEnd.setDate(defaultStart.getDate() + 4);

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-[72px] flex-col justify-center border-b border-[#18C4C7]/35 bg-white px-4 py-3 md:border-b-0 md:border-r">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export default function Home() {
  const [budget, setBudget] = useState(1800);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [tripStart, setTripStart] = useState("Madrid");
  const [destinationType, setDestinationType] = useState<DestinationType | "Todos">("Todos");
  const [includeServices, setIncludeServices] = useState({
    flights: false,
    carRental: false,
  });
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 1, age: 35 },
    { id: 2, age: 34 },
  ]);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const requestPayload = useMemo(
    () => ({
      budget,
      startDate,
      endDate,
      tripStart,
      destinationType,
      includeServices,
      travelers,
    }),
    [budget, destinationType, endDate, includeServices, startDate, travelers, tripStart],
  );

  const fallbackOptions = useMemo(
    () => searchDemoDestinations(requestPayload),
    [requestPayload],
  );

  const options = response?.options ?? fallbackOptions;
  const nights = daysBetween(startDate, endDate);
  const adults = adultsCount(travelers);
  const children = childrenCount(travelers);
  const topOption = options[0];
  const activeExtras = serviceOptions.filter((service) => includeServices[service.key]);

  function updateTravelerAge(id: number, age: number) {
    setTravelers((current) =>
      current.map((traveler) =>
        traveler.id === id ? { ...traveler, age: Math.max(0, Math.min(99, age)) } : traveler,
      ),
    );
  }

  function addTraveler() {
    setTravelers((current) => [
      ...current,
      {
        id: Math.max(...current.map((traveler) => traveler.id)) + 1,
        age: 30,
      },
    ]);
  }

  function removeTraveler(id: number) {
    setTravelers((current) =>
      current.length === 1 ? current : current.filter((traveler) => traveler.id !== id),
    );
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
                Alojamientos en España y Portugal, ordenados de menor a mayor precio y con extras opcionales de vuelos y coche.
              </p>
            </div>
          </header>
        </div>
      </section>

      <section className="-mt-7 px-4 sm:px-8 lg:px-12">
        <form
          onSubmit={submitSearch}
          className="mx-auto grid max-w-7xl overflow-hidden rounded-md border-2 border-[#18C4C7] bg-white shadow-xl md:grid-cols-[1fr_1fr_1.1fr_1fr_1fr_148px]"
        >
          <FieldShell label="Inicio del viaje">
            <select
              value={tripStart}
              onChange={(event) => setTripStart(event.target.value)}
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            >
              {tripStarts.map((start) => (
                <option key={start}>{start}</option>
              ))}
            </select>
          </FieldShell>

          <FieldShell label="Presupuesto">
            <input
              type="number"
              min={100}
              step={50}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            />
          </FieldShell>

          <FieldShell label="Fechas">
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="min-w-0 bg-transparent text-sm font-bold outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="min-w-0 bg-transparent text-sm font-bold outline-none"
              />
            </div>
          </FieldShell>

          <FieldShell label="Ocupacion">
            <div className="mt-1 text-lg font-bold">
              {adults} adultos · {children} niños
            </div>
          </FieldShell>

          <FieldShell label="Tipo">
            <select
              value={destinationType}
              onChange={(event) =>
                setDestinationType(event.target.value as DestinationType | "Todos")
              }
              className="mt-1 w-full bg-transparent text-lg font-bold outline-none"
            >
              {destinationTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FieldShell>

          <button
            type="submit"
            className="min-h-[72px] bg-[#0076E8] px-6 text-xl font-bold text-white transition hover:bg-[#01408D]"
          >
            {isLoading ? "Buscando" : "Buscar"}
          </button>
        </form>
      </section>

      <section className="px-4 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Viajeros</h2>
                <p className="text-sm text-slate-500">Indica edades para ajustar precios.</p>
              </div>
              <button
                type="button"
                onClick={addTraveler}
                className="rounded-md border border-[#18C4C7] px-3 py-2 text-sm font-bold text-[#0156A6]"
              >
                Añadir
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {travelers.map((traveler, index) => (
                <div
                  key={traveler.id}
                  className="grid grid-cols-[1fr_86px_34px] items-center gap-2"
                >
                  <span className="text-sm font-semibold">Persona {index + 1}</span>
                  <input
                    aria-label={`Edad persona ${index + 1}`}
                    type="number"
                    min={0}
                    max={99}
                    value={traveler.age}
                    onChange={(event) => updateTravelerAge(traveler.id, Number(event.target.value))}
                    className="rounded-md border border-slate-300 px-3 py-2 text-right font-bold outline-[#18C4C7]"
                  />
                  <button
                    type="button"
                    onClick={() => removeTraveler(traveler.id)}
                    className="h-10 rounded-md border border-slate-300 text-slate-600"
                    aria-label={`Quitar persona ${index + 1}`}
                  >
                    -
                  </button>
                </div>
              ))}
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
                <h2 className="text-2xl font-bold">Todos los destinos disponibles</h2>
                <p className="text-sm text-slate-500">
                  Precio base de alojamiento
                  {activeExtras.length > 0
                    ? ` + ${activeExtras.map((service) => service.label.toLowerCase()).join(", ")}`
                    : ""}{" "}
                  ordenado de menor a mayor.
                </p>
              </div>
              {topOption ? (
                <div className="rounded-md bg-white px-4 py-3 text-sm shadow-sm">
                  Mas economico: <strong>{topOption.name}</strong> · {formatCurrency(topOption.total)}
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            ) : null}

            {options.length === 0 ? (
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
                              #{index + 1} · Solo alojamiento · {option.type} ·{" "}
                              {option.source === "booking" ? "Booking" : "Demo"}
                            </div>
                            <h3 className="mt-1 text-2xl font-bold">
                              {option.name}, {option.country}
                            </h3>
                            <p className="text-sm text-slate-500">{option.climate}</p>
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
                              <p className="font-bold">{option.accommodationName}</p>
                              <p className="text-sm text-slate-500">
                                {option.accommodationCategory} · {option.board} ·{" "}
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
                          <a
                            href={option.bookingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md bg-[#0156A6] px-4 py-3 font-bold text-white hover:bg-[#01408D]"
                          >
                            Ver en Booking
                          </a>
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
            <nav className="flex flex-wrap gap-2" aria-label="Informacion legal">
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
        </div>
      </footer>
    </main>
  );
}
