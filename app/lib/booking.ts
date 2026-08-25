import {
  adultsCount,
  availableDestinations,
  buildBookingUrl,
  childrenCount,
  daysBetween,
  getTravelerWeight,
} from "./travel-demo";
import type { Destination, TravelSearchRequest, TripOption } from "./travel-demo";

type BookingSearchResponse = {
  data?: unknown[];
};

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bookingName(item: unknown, index: number) {
  const value = asObject(item);
  return (
    asText(value?.name) ??
    asText(value?.accommodation_name) ??
    asText(value?.hotel_name) ??
    `Alojamiento Booking ${index + 1}`
  );
}

function bookingPrice(item: unknown) {
  const value = asObject(item);
  const price = asObject(value?.price);
  const products = Array.isArray(value?.products) ? value.products : [];
  const product = asObject(products[0]);
  const productPrice = asObject(product?.price);

  return asNumber(
    price?.gross_amount ??
      price?.amount ??
      productPrice?.gross_amount ??
      productPrice?.amount,
  );
}

export function bookingConfigured() {
  return Boolean(
    process.env.BOOKING_API_MODE === "live" &&
      process.env.BOOKING_API_TOKEN &&
      process.env.BOOKING_AFFILIATE_ID,
  );
}

export async function searchBookingDestination(
  destination: Destination,
  request: TravelSearchRequest,
): Promise<TripOption[]> {
  if (!bookingConfigured() || !destination.bookingDestinationId) {
    return [];
  }

  const version = process.env.BOOKING_API_VERSION ?? "3.1";
  const endpoint = `https://demandapi.booking.com/${version}/accommodations/search`;
  const childAges = request.travelers
    .filter((traveler) => traveler.age < 18)
    .map((traveler) => traveler.age);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.BOOKING_API_TOKEN}`,
      "Content-Type": "application/json",
      "X-Affiliate-Id": process.env.BOOKING_AFFILIATE_ID ?? "",
    },
    body: JSON.stringify({
      booker: {
        country: process.env.BOOKING_BOOKER_COUNTRY ?? "es",
        platform: "desktop",
      },
      checkin: request.startDate,
      checkout: request.endDate,
      city: Number(destination.bookingDestinationId),
      currency: "EUR",
      guests: {
        number_of_adults: Math.max(1, adultsCount(request.travelers)),
        number_of_rooms: 1,
        children: childAges,
      },
      extras: ["products", "extra_charges"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Booking API devolvio ${response.status}`);
  }

  const payload = (await response.json()) as BookingSearchResponse;
  const nights = daysBetween(request.startDate, request.endDate);
  const travelerWeight = Math.max(1, getTravelerWeight(request.travelers));
  const services = request.includeServices ?? {
    flights: false,
    carRental: false,
  };
  const flights = Math.round(destination.flightEstimate * travelerWeight);
  const carRental = Math.round(destination.carDaily * nights);

  return (payload.data ?? [])
    .map((item, index): TripOption | null => {
      const accommodation = bookingPrice(item);
      if (accommodation === null) return null;

      const roundedAccommodation = Math.round(accommodation);
      const includedFlights = services.flights ? flights : 0;
      const includedCarRental = services.carRental ? carRental : 0;
      const total = roundedAccommodation + includedFlights + includedCarRental;

      return {
        ...destination,
        accommodationName: bookingName(item, index),
        accommodationCategory: "Alojamiento Booking",
        board: "Precio recibido por Booking",
        nightlyPrice: nights > 0 ? Math.round(roundedAccommodation / nights) : roundedAccommodation,
        total,
        perPerson: Math.round(total / Math.max(1, request.travelers.length)),
        remaining: request.budget - total,
        bookingUrl: buildBookingUrl(destination, request),
        source: "booking",
        breakdown: {
          flights: includedFlights,
          accommodation: roundedAccommodation,
          carRental: includedCarRental,
          total,
        },
      };
    })
    .filter((option): option is TripOption => option !== null)
    .filter((option) => option.total <= request.budget)
    .sort((a, b) => a.total - b.total);
}

export async function searchBookingEverywhere(request: TravelSearchRequest) {
  const typeFilter = request.destinationType && request.destinationType !== "Todos"
    ? request.destinationType
    : null;

  const groups = await Promise.all(
    availableDestinations
      .filter((destination) => !typeFilter || destination.type === typeFilter)
      .map((destination) => searchBookingDestination(destination, request)),
  );

  return groups.flat().sort((a, b) => a.total - b.total);
}
