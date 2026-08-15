import { apiClient } from "./apiClient";
import type {
  AircraftDetail,
  AircraftListResponse,
  AircraftQueryParams,
  AircraftTrackResponse,
  AirLabsFlight,
  Airport,
  AirportListResponse,
  Antenna,
  AntennaListResponse,
  BackendHealthResponse,
  BboxParams,
  CacheStatusResponse,
  FleetStats,
} from "./types";

/**
 * Fetch all aircraft matching filters (bounding box, altitude, airline, search, etc.)
 */
export async function fetchAircraftList(
  params?: AircraftQueryParams
): Promise<AircraftListResponse> {
  return apiClient<AircraftListResponse>("/aircraft", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Fetch detailed telemetry for a single aircraft by ID or ICAO24 hex
 */
export async function fetchAircraftDetail(
  aircraftId: string
): Promise<AircraftDetail> {
  return apiClient<AircraftDetail>(`/aircraft/${encodeURIComponent(aircraftId)}`);
}

/**
 * Fetch trajectory / track waypoints for an aircraft
 */
export async function fetchAircraftTrack(
  aircraftId: string,
  time?: number
): Promise<AircraftTrackResponse> {
  return apiClient<AircraftTrackResponse>(
    `/aircraft/${encodeURIComponent(aircraftId)}/track`,
    {
      params: time !== undefined ? { time } : undefined,
    }
  );
}

/**
 * Fetch summary telemetry and metrics for the active fleet
 */
export async function fetchFleetStats(
  bbox?: BboxParams
): Promise<FleetStats> {
  return apiClient<FleetStats>("/stats", {
    params: bbox as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Fetch all airports
 */
export async function fetchAirports(): Promise<Airport[]> {
  const res = await apiClient<AirportListResponse>("/airports");
  return res.airports || [];
}

/**
 * Fetch a single airport by IATA/ICAO code or ID
 */
export async function fetchAirportDetail(code: string): Promise<Airport> {
  return apiClient<Airport>(`/airports/${encodeURIComponent(code)}`);
}

/**
 * Fetch all radar / ADS-B ground stations
 */
export async function fetchAntennas(): Promise<Antenna[]> {
  const res = await apiClient<AntennaListResponse>("/antennas");
  return res.antennas || [];
}

/**
 * Fetch a single antenna by ID
 */
export async function fetchAntennaDetail(id: string): Promise<Antenna> {
  return apiClient<Antenna>(`/antennas/${encodeURIComponent(id)}`);
}

/**
 * Fetch flight telemetry for a specific aircraft transponder
 */
export async function fetchFlightsByAircraft(
  icao24: string
): Promise<AirLabsFlight[]> {
  return apiClient<AirLabsFlight[]>(
    `/flights/aircraft/${encodeURIComponent(icao24)}`
  );
}

/**
 * Check backend aircraft cache status & sync timer
 */
export async function fetchCacheStatus(): Promise<CacheStatusResponse> {
  return apiClient<CacheStatusResponse>("/aircraft/cache/status");
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse> {
  const rootUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "");
  return apiClient<BackendHealthResponse>(`${rootUrl}/health`);
}
