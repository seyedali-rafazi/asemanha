import type { Aircraft as BaseAircraft } from "../pages/Home/components/AircraftLayer/types/Aircraft";
import type { Airport as BaseAirport } from "../pages/Home/components/AirportLayer/types/Airport";
import type { Antenna as BaseAntenna } from "../pages/Home/components/AntennaLayer/types/Antenna";

export interface Aircraft extends BaseAircraft {
  icao24?: string;
  country?: string;
  squawk?: string;
  on_ground?: boolean;
  vertical_rate_fpm?: number;
  geo_altitude_ft?: number;
  category?: number;

  // AirLabs / Route properties
  reg_number?: string;
  flight_icao?: string;
  flight_iata?: string;
  dep_iata?: string;
  dep_icao?: string;
  arr_iata?: string;
  arr_icao?: string;
  airline_icao?: string;
  airline_iata?: string;
  aircraft_icao?: string;
  status?: string;
}

export interface AircraftDetail extends Aircraft {
  sensors?: number[];
  position_source?: string;
  spi?: boolean;
  time_position?: number;
  last_contact?: number;
  coordinates_str?: string;
}

export interface AircraftListResponse {
  total: number;
  count: number;
  time: number;
  aircraft: Aircraft[];
  cached: boolean;
}

export interface FleetStats {
  total_aircraft: number;
  airborne: number;
  on_ground: number;
  airlines_count: number;
  aircraft_types_count: number;
  avg_altitude_ft: number;
  avg_speed_kts: number;
  timestamp: number;
}

export interface TrackWaypoint {
  lat: number;
  lon: number;
  altitude_ft: number;
  heading_deg?: number;
  speed_kts?: number;
  timestamp?: number;
}

export interface AircraftTrackResponse {
  id: string;
  callsign?: string;
  startTime: number;
  endTime: number;
  waypoints: TrackWaypoint[];
  path: [number, number][];
  path_with_altitude: [number, number, number][];
}

export interface AirLabsFlight {
  hex: string;
  reg_number?: string;
  flag?: string;
  lat?: number;
  lng?: number;
  alt?: number;
  dir?: number;
  speed?: number;
  v_speed?: number;
  squawk?: string;
  flight_number?: string;
  flight_icao?: string;
  flight_iata?: string;
  dep_icao?: string;
  dep_iata?: string;
  arr_icao?: string;
  arr_iata?: string;
  airline_icao?: string;
  airline_iata?: string;
  aircraft_icao?: string;
  updated?: number;
  status?: string;
  type?: string;
}

export type Airport = BaseAirport;

export interface AirportListResponse {
  total: number;
  airports: Airport[];
}

export type Antenna = BaseAntenna;

export interface AntennaListResponse {
  total: number;
  antennas: Antenna[];
}

export interface BackendHealthResponse {
  status: string;
  provider?: string;
  airlabs_configured?: boolean;
  cache_ttl_seconds: number;
}

export interface AircraftQueryParams {
  lamin?: number;
  lomin?: number;
  lamax?: number;
  lomax?: number;
  zoom?: number;
  search?: string;
  airline?: string;
  min_altitude?: number;
  max_altitude?: number;
  on_ground?: boolean;
  force_refresh?: boolean;
}

export interface BboxParams {
  lamin?: number;
  lomin?: number;
  lamax?: number;
  lomax?: number;
  zoom?: number;
}
