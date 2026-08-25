import { bookingConfigured, searchBookingEverywhere } from "../../lib/booking";
import {
  accommodationOnlyServices,
  daysBetween,
  getTravelerWeight,
  searchDemoDestinations,
} from "../../lib/travel-demo";
import type { DestinationType, TravelSearchRequest, Traveler } from "../../lib/travel-demo";

const destinationTypes = new Set<DestinationType | "Todos">([
  "Todos",
  "Costa",
  "Montaña",
  "Ciudad",
  "Nieve",
]);

function isTraveler(value: unknown): value is Traveler {
  if (!value || typeof value !== "object") return false;
  const traveler = value as Record<string, unknown>;
  return (
    typeof traveler.id === "number" &&
    typeof traveler.age === "number" &&
    traveler.age >= 0 &&
    traveler.age <= 99
  );
}

function parsePayload(payload: unknown): TravelSearchRequest | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as Record<string, unknown>;
  const destinationType =
    typeof body.destinationType === "string" && destinationTypes.has(body.destinationType as DestinationType | "Todos")
      ? (body.destinationType as DestinationType | "Todos")
      : "Todos";

  if (
    typeof body.budget !== "number" ||
    typeof body.startDate !== "string" ||
    typeof body.endDate !== "string" ||
    !Array.isArray(body.travelers) ||
    body.travelers.length === 0 ||
    !body.travelers.every(isTraveler)
  ) {
    return null;
  }

  return {
    budget: Math.max(0, body.budget),
    startDate: body.startDate,
    endDate: body.endDate,
    travelers: body.travelers.slice(0, 12),
    tripStart: typeof body.tripStart === "string" ? body.tripStart : "Madrid",
    destinationType,
    includeServices:
      body.includeServices && typeof body.includeServices === "object"
        ? {
            flights: Boolean((body.includeServices as Record<string, unknown>).flights),
            carRental: Boolean((body.includeServices as Record<string, unknown>).carRental),
          }
        : accommodationOnlyServices,
  };
}

export async function POST(request: Request) {
  try {
    const payload = parsePayload(await request.json());

    if (!payload) {
      return Response.json({ error: "Solicitud de busqueda no valida" }, { status: 400 });
    }

    const nights = daysBetween(payload.startDate, payload.endDate);
    if (nights <= 0) {
      return Response.json(
        { error: "La fecha final debe ser posterior a la fecha de inicio" },
        { status: 400 },
      );
    }

    let mode: "demo" | "booking" = "demo";
    let message =
      "Modo demo activo. El importe principal calcula alojamiento; puedes activar vuelos y coche como extras.";
    let options = searchDemoDestinations(payload);

    if (bookingConfigured()) {
      try {
        const liveOptions = await searchBookingEverywhere(payload);
        if (liveOptions.length > 0) {
          mode = "booking";
          options = liveOptions;
          message = "Resultados ordenados con precios recibidos desde Booking Demand API.";
        } else {
          message = "Booking no devolvio alojamientos dentro del presupuesto; se muestran estimaciones demo.";
        }
      } catch (error) {
        message =
          error instanceof Error
            ? `${error.message}. Se muestran estimaciones demo.`
            : "Booking no pudo responder. Se muestran estimaciones demo.";
      }
    }

    return Response.json({
      mode,
      message,
      options,
      summary: {
        nights,
        travelers: payload.travelers.length,
        travelerWeight: getTravelerWeight(payload.travelers),
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo completar la busqueda",
      },
      { status: 500 },
    );
  }
}
