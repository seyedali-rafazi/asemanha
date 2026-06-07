export interface Airport {
  id: string;
  name: string;
  iata: string;
  icao: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  elevation_ft: number;
  runways: number;
}
