export type DestinationType = "Costa" | "Montaña" | "Ciudad" | "Nieve";

export type Traveler = {
  id: number;
  age: number;
};

export type TravelSearchRequest = {
  budget: number;
  startDate: string;
  endDate: string;
  travelers: Traveler[];
  tripStart?: string;
  destinationType?: DestinationType | "Todos";
  includeServices?: ServiceSelection;
};

export type ServiceSelection = {
  flights: boolean;
  carRental: boolean;
};

export type Destination = {
  id: string;
  name: string;
  country: string;
  type: DestinationType;
  climate: string;
  image: string;
  bookingDestinationId?: string;
  flightEstimate: number;
  baseNight: number;
  localDaily: number;
  transferBase: number;
  carDaily: number;
  accommodations: Array<{
    name: string;
    category: string;
    board: string;
    factor: number;
  }>;
};

export type CostBreakdown = {
  flights: number;
  accommodation: number;
  carRental: number;
  total: number;
};

export type TripOption = Destination & {
  accommodationName: string;
  accommodationCategory: string;
  board: string;
  nightlyPrice: number;
  total: number;
  perPerson: number;
  remaining: number;
  bookingUrl: string;
  source: "demo" | "booking";
  breakdown: CostBreakdown;
};

export const destinations: Destination[] = [
  {
    id: "valencia",
    name: "Valencia",
    country: "España",
    type: "Costa",
    climate: "Mediterraneo urbano",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-406131",
    flightEstimate: 68,
    baseNight: 82,
    localDaily: 38,
    transferBase: 24,
    carDaily: 24,
    accommodations: [
      { name: "Casual Vintage Valencia", category: "Hotel centrico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Hotel Kramer Valencia", category: "Hotel recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "Helen Berger Boutique Hotel", category: "Boutique superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "granada",
    name: "Granada",
    country: "España",
    type: "Ciudad",
    climate: "Historico y cultural",
    image:
      "https://images.unsplash.com/photo-1568849676085-51415703900f?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-383094",
    flightEstimate: 72,
    baseNight: 76,
    localDaily: 34,
    transferBase: 22,
    carDaily: 22,
    accommodations: [
      { name: "Hotel Inglaterra Granada", category: "Hotel historico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Eurostars Catedral", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Palacio de Santa Ines", category: "Hotel con encanto", board: "Mejor ubicacion", factor: 1.22 },
    ],
  },
  {
    id: "porto",
    name: "Oporto",
    country: "Portugal",
    type: "Ciudad",
    climate: "Atlantico suave",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-2173088",
    flightEstimate: 86,
    baseNight: 74,
    localDaily: 35,
    transferBase: 26,
    carDaily: 25,
    accommodations: [
      { name: "Moov Hotel Porto Centro", category: "Hotel funcional", board: "Solo alojamiento", factor: 0.86 },
      { name: "Legendary Porto Hotel", category: "Hotel recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "PortoBay Teatro", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Marruecos",
    type: "Ciudad",
    climate: "Calido y exotico",
    image:
      "https://images.unsplash.com/photo-1597212720410-f4e2f5f6c9c8?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-38833",
    flightEstimate: 118,
    baseNight: 64,
    localDaily: 30,
    transferBase: 20,
    carDaily: 26,
    accommodations: [
      { name: "Riad Dar One", category: "Riad economico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Riad Palais Sebban", category: "Riad recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Les Jardins de la Koutoubia", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "tenerife",
    name: "Tenerife",
    country: "España",
    type: "Costa",
    climate: "Primavera todo el año",
    image:
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-404682",
    flightEstimate: 132,
    baseNight: 88,
    localDaily: 40,
    transferBase: 30,
    carDaily: 31,
    accommodations: [
      { name: "Hotel Principe Paz", category: "Hotel urbano", board: "Solo alojamiento", factor: 0.86 },
      { name: "H10 Tenerife Playa", category: "Hotel costa", board: "Desayuno incluido", factor: 1 },
      { name: "Hotel Botanico & The Oriental Spa Garden", category: "Resort superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "lisbon",
    name: "Lisboa",
    country: "Portugal",
    type: "Ciudad",
    climate: "Atlantico luminoso",
    image:
      "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-2167973",
    flightEstimate: 92,
    baseNight: 96,
    localDaily: 42,
    transferBase: 28,
    carDaily: 28,
    accommodations: [
      { name: "Hotel Gat Rossio", category: "Hotel centrico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Lisboa Pessoa Hotel", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Memmo Alfama", category: "Boutique superior", board: "Mejor ubicacion", factor: 1.22 },
    ],
  },
  {
    id: "algarve",
    name: "Algarve",
    country: "Portugal",
    type: "Costa",
    climate: "Playas y acantilados",
    image:
      "https://images.unsplash.com/photo-1599677101131-8a428b29d04b?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "1087",
    flightEstimate: 112,
    baseNight: 104,
    localDaily: 44,
    transferBase: 34,
    carDaily: 34,
    accommodations: [
      { name: "Hotel Sol Algarve", category: "Hotel economico", board: "Solo alojamiento", factor: 0.86 },
      { name: "AP Eva Senses", category: "Hotel costa", board: "Desayuno incluido", factor: 1 },
      { name: "Tivoli Carvoeiro Algarve Resort", category: "Resort superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "athens",
    name: "Atenas",
    country: "Grecia",
    type: "Ciudad",
    climate: "Mediterraneo historico",
    image:
      "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-814876",
    flightEstimate: 154,
    baseNight: 86,
    localDaily: 38,
    transferBase: 30,
    carDaily: 28,
    accommodations: [
      { name: "Acropolis Select", category: "Hotel urbano", board: "Solo alojamiento", factor: 0.86 },
      { name: "Athens21", category: "Hotel recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "Electra Metropolis Athens", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "lake-bled",
    name: "Lago Bled",
    country: "Eslovenia",
    type: "Montaña",
    climate: "Alpino y lagos",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-75577",
    flightEstimate: 148,
    baseNight: 92,
    localDaily: 36,
    transferBase: 36,
    carDaily: 38,
    accommodations: [
      { name: "Old Bled House", category: "Casa alpina", board: "Solo alojamiento", factor: 0.86 },
      { name: "Hotel Lovec Bled", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Adora Luxury Hotel", category: "Hotel lago superior", board: "Mejor vista", factor: 1.22 },
    ],
  },
  {
    id: "krakow",
    name: "Cracovia",
    country: "Polonia",
    type: "Ciudad",
    climate: "Cultural y economico",
    image:
      "https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-510625",
    flightEstimate: 124,
    baseNight: 70,
    localDaily: 32,
    transferBase: 24,
    carDaily: 24,
    accommodations: [
      { name: "Hotel Wyspianski", category: "Hotel centrico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Amber Boutique Hotels", category: "Boutique recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "Hotel Stary", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "sofia",
    name: "Sofia",
    country: "Bulgaria",
    type: "Ciudad",
    climate: "Urbano con montaña cerca",
    image:
      "https://images.unsplash.com/photo-1597742932595-b725a72bdc04?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-838489",
    flightEstimate: 142,
    baseNight: 58,
    localDaily: 27,
    transferBase: 18,
    carDaily: 23,
    accommodations: [
      { name: "Central Hotel Sofia", category: "Hotel funcional", board: "Solo alojamiento", factor: 0.86 },
      { name: "Rosslyn Thracia Hotel Sofia", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Grand Hotel Sofia", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "interlaken",
    name: "Interlaken",
    country: "Suiza",
    type: "Montaña",
    climate: "Alpes y aventura",
    image:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-2552469",
    flightEstimate: 170,
    baseNight: 148,
    localDaily: 62,
    transferBase: 44,
    carDaily: 46,
    accommodations: [
      { name: "Hotel Beausite Interlaken", category: "Hotel alpino", board: "Solo alojamiento", factor: 0.86 },
      { name: "Hotel Interlaken", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Victoria Jungfrau Grand Hotel", category: "Hotel premium", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "chamonix",
    name: "Chamonix",
    country: "Francia",
    type: "Nieve",
    climate: "Alta montaña",
    image:
      "https://images.unsplash.com/photo-1488572749058-7f52dd70e0fa?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-1418462",
    flightEstimate: 168,
    baseNight: 136,
    localDaily: 58,
    transferBase: 48,
    carDaily: 44,
    accommodations: [
      { name: "Hotel de L'Arve", category: "Hotel de montaña", board: "Solo alojamiento", factor: 0.86 },
      { name: "Alpina Eclectic Hotel", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Heliopic Hotel & Spa", category: "Hotel spa", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "zermatt",
    name: "Zermatt",
    country: "Suiza",
    type: "Nieve",
    climate: "Esqui premium",
    image:
      "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-2554928",
    flightEstimate: 198,
    baseNight: 184,
    localDaily: 72,
    transferBase: 58,
    carDaily: 48,
    accommodations: [
      { name: "Hotel Bahnhof Zermatt", category: "Hotel alpino", board: "Solo alojamiento", factor: 0.86 },
      { name: "Hotel Butterfly", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Schlosshotel Zermatt", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    type: "Costa",
    climate: "Tropical",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "835",
    flightEstimate: 520,
    baseNight: 72,
    localDaily: 31,
    transferBase: 22,
    carDaily: 26,
    accommodations: [
      { name: "Grandmas Plus Hotel Seminyak", category: "Hotel economico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Ubud Wana Resort", category: "Resort recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Maya Sanur Resort & Spa", category: "Resort superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "phuket",
    name: "Phuket",
    country: "Tailandia",
    type: "Costa",
    climate: "Tropical playa",
    image:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-3253342",
    flightEstimate: 548,
    baseNight: 68,
    localDaily: 29,
    transferBase: 22,
    carDaily: 25,
    accommodations: [
      { name: "The Memory at On On Hotel", category: "Hotel historico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Burasari Phuket Resort", category: "Resort recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "The Slate Phuket", category: "Resort superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "new-york",
    name: "Nueva York",
    country: "Estados Unidos",
    type: "Ciudad",
    climate: "Gran ciudad",
    image:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "20088325",
    flightEstimate: 420,
    baseNight: 178,
    localDaily: 74,
    transferBase: 52,
    carDaily: 54,
    accommodations: [
      { name: "Pod Times Square", category: "Hotel urbano", board: "Solo alojamiento", factor: 0.86 },
      { name: "Arlo Midtown", category: "Hotel recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "The Bryant Park Hotel", category: "Hotel superior", board: "Mejor ubicacion", factor: 1.22 },
    ],
  },
  {
    id: "punta-cana",
    name: "Punta Cana",
    country: "Republica Dominicana",
    type: "Costa",
    climate: "Caribe",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-3364339",
    flightEstimate: 480,
    baseNight: 122,
    localDaily: 46,
    transferBase: 36,
    carDaily: 32,
    accommodations: [
      { name: "Hotel Marimba Punta Cana", category: "Hotel economico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Impressive Punta Cana", category: "Resort recomendado", board: "Todo incluido opcional", factor: 1 },
      { name: "Majestic Elegance Punta Cana", category: "Resort superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "cusco",
    name: "Cusco",
    country: "Peru",
    type: "Montaña",
    climate: "Andes y cultura",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-344507",
    flightEstimate: 610,
    baseNight: 62,
    localDaily: 32,
    transferBase: 28,
    carDaily: 30,
    accommodations: [
      { name: "Tierra Viva Cusco Centro", category: "Hotel centrico", board: "Solo alojamiento", factor: 0.86 },
      { name: "Antigua Casona San Blas", category: "Hotel recomendado", board: "Desayuno incluido", factor: 1 },
      { name: "Palacio del Inka", category: "Hotel superior", board: "Mejor valoracion", factor: 1.22 },
    ],
  },
  {
    id: "queenstown",
    name: "Queenstown",
    country: "Nueva Zelanda",
    type: "Montaña",
    climate: "Lagos y aventura",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    bookingDestinationId: "-1515454",
    flightEstimate: 820,
    baseNight: 132,
    localDaily: 58,
    transferBase: 46,
    carDaily: 48,
    accommodations: [
      { name: "Heartland Hotel Queenstown", category: "Hotel de montaña", board: "Solo alojamiento", factor: 0.86 },
      { name: "Scenic Suites Queenstown", category: "Hotel recomendado", board: "Desayuno opcional", factor: 1 },
      { name: "QT Queenstown", category: "Hotel superior", board: "Mejor vista", factor: 1.22 },
    ],
  },
];

export const availableDestinations = destinations.filter((destination) =>
  ["España", "Portugal"].includes(destination.country),
);

export const accommodationOnlyServices: ServiceSelection = {
  flights: false,
  carRental: false,
};

export function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

export function adultsCount(travelers: Traveler[]) {
  return travelers.filter((traveler) => traveler.age >= 18).length;
}

export function childrenCount(travelers: Traveler[]) {
  return travelers.filter((traveler) => traveler.age < 18).length;
}

export function getTravelerWeight(travelers: Traveler[]) {
  return travelers.reduce((total, traveler) => {
    if (traveler.age < 2) return total + 0.15;
    if (traveler.age < 12) return total + 0.6;
    if (traveler.age < 18) return total + 0.8;
    return total + 1;
  }, 0);
}

function startMultiplier(tripStart?: string) {
  const normalized = (tripStart ?? "").toLowerCase();
  if (normalized.includes("barcelona")) return 0.96;
  if (normalized.includes("valencia")) return 0.98;
  if (normalized.includes("sevilla")) return 1.04;
  if (normalized.includes("bilbao")) return 1.06;
  return 1;
}

export function buildBookingUrl(destination: Destination, request: TravelSearchRequest) {
  const adults = Math.max(1, adultsCount(request.travelers));
  const children = childrenCount(request.travelers);
  const query = new URLSearchParams({
    ss: `${destination.name} ${destination.country}`,
    checkin: request.startDate,
    checkout: request.endDate,
    group_adults: String(adults),
    group_children: String(children),
    no_rooms: "1",
  });

  return `https://www.booking.com/searchresults.es.html?${query.toString()}`;
}

export function searchDemoDestinations(request: TravelSearchRequest): TripOption[] {
  const nights = daysBetween(request.startDate, request.endDate);
  const travelerWeight = Math.max(1, getTravelerWeight(request.travelers));
  const services = request.includeServices ?? accommodationOnlyServices;
  const typeFilter = request.destinationType && request.destinationType !== "Todos"
    ? request.destinationType
    : null;

  if (nights <= 0) return [];

  return availableDestinations
    .filter((destination) => !typeFilter || destination.type === typeFilter)
    .flatMap((destination) => {
      const flights = Math.round(destination.flightEstimate * travelerWeight * startMultiplier(request.tripStart));
      const carRental = Math.round(destination.carDaily * nights);
      return destination.accommodations.map((accommodationOption) => {
        const nightlyPrice = Math.round(destination.baseNight * accommodationOption.factor);
        const accommodation = Math.round(nightlyPrice * nights * Math.max(1, travelerWeight / 2));
        const includedFlights = services.flights ? flights : 0;
        const includedCarRental = services.carRental ? carRental : 0;
        const total = accommodation + includedFlights + includedCarRental;

        return {
          ...destination,
          accommodationName: accommodationOption.name,
          accommodationCategory: accommodationOption.category,
          board: accommodationOption.board,
          nightlyPrice,
          total,
          perPerson: Math.round(total / Math.max(1, request.travelers.length)),
          remaining: request.budget - total,
          bookingUrl: buildBookingUrl(destination, request),
          source: "demo" as const,
          breakdown: {
            flights: includedFlights,
            accommodation,
            carRental: includedCarRental,
            total,
          },
        };
      });
    })
    .filter((option) => option.total <= request.budget)
    .sort((a, b) => a.total - b.total);
}
