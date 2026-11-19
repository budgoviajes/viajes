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

const bookingWidgetId = "bookingAffiliateWidget_806778a0-a45e-4749-8284-7cfde492c8e0";

function cjTrackedLink(destinationUrl: string, sid: string) {
  const link = new URL("https://www.jdoqocy.com/click-101926096-17323139");
  link.searchParams.set("sid", sid);
  link.searchParams.set("url", destinationUrl);
  return link.toString();
}

const today = new Date();
const defaultStart = new Date(today);
const defaultEnd = new Date(today);
defaultEnd.setDate(defaultEnd.getDate() + 1);

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

function OfficialBookingWidget({ open }: { open: boolean }) {
  useEffect(() => {
    if (!open || document.querySelector('script[data-budgo-booking-widget="true"]')) return;

    const script = document.createElement("script");
    script.src = "https://www.booking.com/affiliate/prelanding_sdk";
    script.async = true;
    script.dataset.budgoBookingWidget = "true";
    script.onload = () => {
      const booking = (window as Window & {
        Booking?: { AffiliateWidget: new (settings: Record<string, unknown>) => unknown };
      }).Booking;
      if (!booking?.AffiliateWidget) return;
      new booking.AffiliateWidget({
        iframeSettings: { selector: bookingWidgetId, responsive: true },
        widgetSettings: {
          destinationurloverride: "https://www.jdoqocy.com/click-101926096-17323139?sid=budgo_widget",
        },
      });
    };
    document.head.appendChild(script);
  }, [open]);

  if (!open) return null;

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
      <p className="font-bold">Buscador oficial de Booking.com</p>
      <p className="mt-1 text-sm text-slate-500">La búsqueda, la disponibilidad y el precio final se gestionan directamente por Booking.com.</p>
      <div id={bookingWidgetId} className="mt-4" />
      <img src="https://www.awltovhc.com/image-101926096-17323139" width="1" height="1" alt="" />
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
  const [bookingWidgetOpen, setBookingWidgetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [travelIdea, setTravelIdea] = useState("");
  const [activeMood, setActiveMood] = useState("Para ti");
  const [visibleDestinationCount, setVisibleDestinationCount] = useState(6);

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
  const visibleOptions = options.filter((option) => {
    if (["Para ti", "Pareja", "Familia"].includes(activeMood)) return true;
    if (activeMood === "Playa") return option.type === "Costa";
    if (activeMood === "Ciudad") return option.type === "Ciudad";
    return option.id === "tenerife";
  });
  const topOption = visibleOptions[0];
  const displayedOptions = visibleOptions.slice(0, visibleDestinationCount);
  const activeExtras = serviceOptions.filter((service) => includeServices[service.key]);
  const ideaSummary = useMemo(() => {
    const idea = travelIdea.trim().toLowerCase();
    if (!idea) return "";
    const parts: string[] = [];
    const origin = tripStarts.find((item) => idea.includes(item.toLowerCase()));
    const budgetMatch = idea.match(/(?:hasta|presupuesto(?: de)?|por)\s*(\d{2,5})\s*€?/) ?? idea.match(/(\d{2,5})\s*€/);
    const adultsMatch = idea.match(/(\d+)\s*(?:adultos?|personas?)/);
    const childrenMatch = idea.match(/(\d+)\s*(?:niños?|ninos?|peques?)/);
    const range = idea.match(/(?:del?|desde(?:\s+el)?|entre)?\s*(\d{1,2})\s*(?:al|a|hasta|-)\s*(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i);
    if (origin) parts.push(origin);
    if (budgetMatch) parts.push(`${budgetMatch[1]} €`);
    if (range) parts.push(`${range[1]}–${range[2]} ${range[3]}`);
    if (adultsMatch) parts.push(`${adultsMatch[1]} adultos`);
    if (childrenMatch) parts.push(`${childrenMatch[1]} niños`);
    return parts.length ? `Entendido: ${parts.join(" · ")}` : "Escribe origen, presupuesto, fechas o viajeros para preparar tu búsqueda.";
  }, [travelIdea]);

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

  function prepareIdea(rawIdea = travelIdea) {
    const idea = rawIdea.trim().toLowerCase();
    if (!idea) return;
    const budgetMatch = idea.match(/(?:hasta|presupuesto(?: de)?|por)\s*(\d{2,5})\s*€?/) ?? idea.match(/(\d{2,5})\s*€/);
    if (budgetMatch) setBudget(Number(budgetMatch[1]));

    const adultsMatch = idea.match(/(\d+)\s*(?:adultos?|personas?|parejas?)/);
    const childrenMatch = idea.match(/(\d+)\s*(?:niños?|ninos?|peques?)/);
    const inferredAdults = adultsMatch ? Number(adultsMatch[1]) : /pareja|dos personas/.test(idea) ? 2 : adults;
    const inferredChildren = childrenMatch ? Number(childrenMatch[1]) : children;
    const ageText = idea.match(/(?:niños?|ninos?|peques?)([\s\S]*)$/i)?.[1] ?? "";
    const writtenChildAges = (ageText.match(/\b(?:1[0-7]|[0-9])\b/g) ?? []).map(Number).filter((age) => age >= 0 && age < 18);
    const childAges = Array.from({ length: inferredChildren }, (_, index) => writtenChildAges[index] ?? 8);
    if (inferredAdults || inferredChildren) setOccupancy(inferredAdults, childAges);

    const requestedOrigin = tripStarts.find((origin) => idea.includes(origin.toLowerCase()));
    if (requestedOrigin) setTripStart(requestedOrigin);

    const months: Record<string, number> = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
    const dateRange = idea.match(/(?:del?|desde(?:\s+el)?|entre)?\s*(\d{1,2})\s*(?:al|a|hasta|-)\s*(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?/i);
    if (dateRange) {
      const [, startDay, endDay, monthName, writtenYear] = dateRange;
      const year = Number(writtenYear ?? new Date().getFullYear());
      const month = months[monthName.toLowerCase()];
      const start = new Date(year, month, Number(startDay));
      const end = new Date(year, month, Number(endDay));
      if (start.getMonth() === month && end.getMonth() === month) {
        setStartDateText(toDisplayDate(toDateInput(start)));
        setEndDateText(toDisplayDate(toDateInput(end)));
      }
    } else {
      const daysMatch = idea.match(/(\d+)\s*d[ií]as?/);
      if (daysMatch && Number(daysMatch[1]) > 0) {
        const start = new Date();
        const end = new Date(start);
        end.setDate(start.getDate() + Number(daysMatch[1]));
        setStartDateText(toDisplayDate(toDateInput(start)));
        setEndDateText(toDisplayDate(toDateInput(end)));
      }
    }
    setResponse(null);
    setError("");
    setHasSearched(true);
    setVisibleDestinationCount(6);
    document.querySelector("#budgo-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tripStart || budget <= 0 || travelers.length === 0 || !startDate || !endDate) {
      setError("Selecciona el origen, un presupuesto, las fechas y al menos un viajero.");
      return;
    }
    localStorage.setItem(searchStorageKey, JSON.stringify({ ...requestPayload, savedAt: Date.now() }));
    setHasSearched(true);
    setVisibleDestinationCount(6);
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
      <section className="relative overflow-hidden bg-[linear-gradient(100deg,rgba(2,50,137,.97),rgba(1,92,183,.91),rgba(1,106,186,.62)),url('https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=2000&q=85')] bg-cover bg-center px-4 pb-28 pt-3 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="flex min-h-16 items-center justify-between gap-5">
            <div>
              <img
                src="/budgo-logo.png"
                alt="Budgo"
                className="h-24 w-[270px] object-cover [object-position:center_42%] mix-blend-multiply contrast-125 saturate-125 max-sm:h-[68px] max-sm:w-[190px]"
              />
            </div>
            <nav className="hidden items-center gap-7 text-sm font-bold text-white/90 md:flex" aria-label="Navegación principal"><a href="#como-funciona">Cómo funciona</a><a href="#destinos">Inspiración</a><a href="#ofertas">Ofertas</a></nav>
          </header>
          <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-16">
            <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-white/85">Tu presupuesto marca el camino</span>
            <h1 className="mt-5 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl lg:text-7xl">Tu próxima escapada,<br />dentro de tu presupuesto.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">Dinos cuánto quieres gastar y Budgo encuentra destinos que encajan contigo.</p>
            <div id="como-funciona" className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-2 text-left shadow-2xl shadow-blue-950/25 sm:flex-nowrap sm:p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-xl text-[#0076E8]">✦</span>
              <input value={travelIdea} onChange={(event) => setTravelIdea(event.target.value)} placeholder="Ej.: 4 días de playa en junio, para dos personas, hasta 900 €" className="min-w-0 flex-1 bg-transparent px-1 py-2 font-bold text-slate-800 outline-none" aria-label="Describe tu viaje ideal" />
              <button type="button" onClick={prepareIdea} className="w-full shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-[#0076E8] px-5 py-3 font-black text-white shadow-lg sm:w-auto">Preparar búsqueda</button>
            </div>
            <p className="mt-2 min-h-5 text-sm font-bold text-cyan-100" aria-live="polite">{ideaSummary}</p>
            <p className="mt-3 text-xs text-white/75">Cuéntanos tu idea y prepararemos el formulario para ti.</p>
          </div>
        </div>
      </section>

      <section className="-mt-7 px-4 sm:px-8 lg:px-12">
        <form
          onSubmit={submitSearch}
          id="budgo-search"
          className="mx-auto grid max-w-7xl gap-2 rounded-[20px] border border-[#18C4C7]/75 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 md:grid-cols-[1.12fr_.95fr_1.42fr_1.08fr_158px]"
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
        <p className="mx-auto mt-4 max-w-7xl text-center text-xs font-bold text-slate-600 sm:text-sm">✦ Presupuestos orientativos <span className="mx-2 text-slate-300">·</span> ↗ Reserva siempre en el proveedor <span className="mx-2 text-slate-300">·</span> ✓ Sin coste adicional para ti</p>
      </section>

      <section className="px-4 py-7 sm:px-8 lg:px-12">
        <div className={`mx-auto grid max-w-7xl gap-6 ${travelers.length ? "lg:grid-cols-[260px_1fr]" : ""}`}>
          {travelers.length ? <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
          </aside> : null}

          <section id="destinos">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black tracking-[-.04em]">Escapadas que encajan contigo</h2>
                <p className="text-sm text-slate-500">
                  Presupuestos orientativos de Budgo
                  {activeExtras.length > 0
                    ? ` + ${activeExtras.map((service) => service.label.toLowerCase()).join(", ")}`
                    : ""}{" "}
                  ordenado de menor a mayor.
                </p>
              </div>
              {topOption ? (
                <div className="rounded-md bg-white px-4 py-3 text-sm shadow-sm">
                  Estimación más baja: <strong>{topOption.name}</strong> · {formatCurrency(topOption.total)}
                </div>
              ) : null}
            </div>

            <div className="mb-5 flex flex-wrap gap-2" aria-label="Ideas de viaje">{["Para ti", "Playa", "Ciudad", "Naturaleza", "Pareja", "Familia"].map((filter) => <button type="button" key={filter} onClick={() => setActiveMood(filter)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${activeMood === filter ? "border-[#0156A6] bg-[#0156A6] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#0156A6]"}`}>{filter}</button>)}</div>

            <div className="mb-4 rounded-md border border-[#18C4C7]/40 bg-[#EAFBFB] px-4 py-3 text-sm leading-relaxed text-slate-700">
              <strong>Estimaciones Budgo:</strong> confirma siempre el precio final y la disponibilidad en Booking.com.
            </div>

            {error ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            ) : null}

            {!hasSearched ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black">Empieza por una idea</h3>
                <p className="mt-2 text-slate-500">Completa la búsqueda o inspírate con estas escapadas. Budgo te ayudará a ajustar el viaje a tu presupuesto.</p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[['Escapada de playa', 'Sol, costa y desconexión para unos días.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '4 días de playa para dos personas hasta 900 €'], ['Fin de semana cultural', 'Ciudades con historia, gastronomía y paseos.', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80', '3 días de ciudad para dos personas hasta 700 €'], ['Naturaleza en familia', 'Rutas y planes para viajar con calma.', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', '4 días de naturaleza para 2 adultos y 2 niños hasta 1200 €']].map(([title, copy, image, idea]) => <button type="button" key={title} onClick={() => { setTravelIdea(idea); prepareIdea(idea); }} className="min-h-40 rounded-xl bg-cover bg-center p-4 text-left text-white transition hover:-translate-y-1 hover:shadow-xl" style={{ backgroundImage: `linear-gradient(145deg, rgba(1,86,166,.88), rgba(24,196,199,.62)), url(${image})` }}><strong className="text-lg">{title}</strong><p className="mt-2 text-sm text-white/90">{copy}</p></button>)}
                </div>
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-bold">No hay destinos dentro del presupuesto</h3>
                <p className="mt-2 text-slate-500">
                  Sube el importe, reduce noches o prueba otro tipo de destino.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {displayedOptions.map((option, index) => {
                  const percent = Math.min(100, Math.round((option.total / budget) * 100));
                  const key = `${option.id}-${option.accommodationName}-${index}`;

                  return (
                    <article
                      key={key}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <img
                        src={option.image}
                        alt={`${option.name}, ${option.country}`}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-[#0156A6]">
                              #{index + 1} · Destino recomendado · Presupuesto Budgo
                            </div>
                            <h3 className="mt-1 text-xl font-black">
                              {option.name}, {option.country}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {option.climate}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-[#0156A6]">
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
                              <p className="font-bold">Presupuesto orientativo de alojamiento</p>
                              <p className="text-sm text-slate-500">
                                No representa un hotel concreto ni una tarifa de Booking. Comprueba el precio final en Booking.com.
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
                              Ver alojamientos en Booking.com
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

            {hasSearched && visibleOptions.length > displayedOptions.length ? <button type="button" onClick={() => setVisibleDestinationCount((current) => current + 6)} className="mt-5 w-full rounded-xl border border-[#0156A6] bg-white px-4 py-3 font-black text-[#0156A6] hover:bg-blue-50">Ver más destinos ({visibleOptions.length - displayedOptions.length})</button> : null}

            <section id="ofertas" className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
              <h3 className="text-lg font-bold">Comprueba la disponibilidad real en Booking.com</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Usa las herramientas oficiales de Booking para comprobar alojamientos, fechas, viajeros, condiciones y precio final.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={cjTrackedLink("https://www.booking.com/index.es.html", "budgo_enlace_ofertas")}
                  target="_blank"
                  rel="noopener sponsored"
                  onClick={(event) => trackBookingClick(event.currentTarget.href)}
                  className="rounded-md border border-[#0156A6] bg-white px-4 py-3 font-bold text-[#0156A6] hover:bg-blue-50"
                >
                  Ver ofertas de alojamiento
                </a>
                <button
                  type="button"
                  onClick={() => setBookingWidgetOpen((current) => !current)}
                  aria-expanded={bookingWidgetOpen}
                  className="rounded-md bg-[#0156A6] px-4 py-3 font-bold text-white hover:bg-[#01408D]"
                >
                  {bookingWidgetOpen ? "Cerrar buscador oficial" : "Abrir buscador oficial de Booking"}
                </button>
              </div>
              <a
                href={cjTrackedLink("https://www.booking.com/index.es.html", "budgo_banner_ofertas")}
                target="_blank"
                rel="noopener sponsored"
                onClick={(event) => trackBookingClick(event.currentTarget.href)}
                className="mt-4 block rounded-md bg-[#003B7A] p-4 text-white hover:bg-[#002c5c]"
              >
                <span className="block text-xs font-bold uppercase tracking-wide text-blue-200">Enlace promocional a Booking.com</span>
                <span className="mt-1 block font-bold">Explora alojamientos y ofertas para tu próxima escapada</span>
              </a>
              <p className="mt-3 text-xs text-slate-500">Este espacio se puede sustituir por cualquier banner oficial que generes en el Centro de contenido de Booking/CJ.</p>
              <OfficialBookingWidget open={bookingWidgetOpen} />
            </section>
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
