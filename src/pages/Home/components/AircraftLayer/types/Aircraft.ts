export interface Aircraft {
  id: string;
  callsign: string;
  airline: string;
  aircraftType: string;
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
