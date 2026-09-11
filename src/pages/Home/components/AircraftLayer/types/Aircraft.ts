export interface Aircraft {
  id: string;
  callsign: string;
  airline: string;
  aircraftType: string;
  /** ICAO aircraft type designator when provided by the API (e.g. B738, A320). */
  aircraft_icao?: string;
  /** ADS-B emitter category (OpenSky / DO-260B style integer), when available. */
  category?: number;
  model?: string;
  manufacturer?: string;
  lat: number;
  lon: number;
  altitude_ft: number;
  heading_deg: number;
  speed_kts: number;
  origin_city: string;
  destination_city: string;
  path: [number, number][];
  lastUpdate: string;
}
