import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  fetchAircraftDetail,
  fetchAircraftList,
  fetchAircraftTrack,
  fetchAirports,
  fetchAntennas,
  fetchFleetStats,
  fetchFlightsByAircraft,
} from "../services/flightApi";
import type {
  AircraftDetail,
  AircraftListResponse,
  AircraftQueryParams,
  AircraftTrackResponse,
  AirLabsFlight,
  Airport,
  Antenna,
  BboxParams,
  FleetStats,
} from "../services/types";

export const queryKeys = {
  aircraft: {
    all: ["aircraft"] as const,
    lists: () => [...queryKeys.aircraft.all, "list"] as const,
    list: (params?: AircraftQueryParams) =>
      [...queryKeys.aircraft.lists(), params] as const,
    details: () => [...queryKeys.aircraft.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.aircraft.details(), id] as const,
    tracks: () => [...queryKeys.aircraft.all, "track"] as const,
    track: (id: string, time?: number) =>
      [...queryKeys.aircraft.tracks(), id, time] as const,
    history: (id: string) =>
      [...queryKeys.aircraft.all, "history", id] as const,
  },
  fleet: {
    all: ["fleet"] as const,
    stats: (bbox?: BboxParams) => [...queryKeys.fleet.all, "stats", bbox] as const,
  },
  airports: {
    all: ["airports"] as const,
  },
  antennas: {
    all: ["antennas"] as const,
  },
};

/**
 * Hook to query live aircraft fleet matching bounding box (bbox), zoom level, and filters.
 */
export function useAircraftListQuery(
  params?: AircraftQueryParams,
  options?: Partial<UseQueryOptions<AircraftListResponse, Error>>
) {
  return useQuery<AircraftListResponse, Error>({
    queryKey: queryKeys.aircraft.list(params),
    queryFn: () => fetchAircraftList(params),
    placeholderData: keepPreviousData,
    staleTime: 30000,
    refetchInterval: 15000,
    ...options,
  });
}

/**
 * Hook to query detailed telemetry for an individual aircraft.
 */
export function useAircraftDetailQuery(
  aircraftId?: string | null,
  options?: Partial<UseQueryOptions<AircraftDetail, Error>>
) {
  return useQuery<AircraftDetail, Error>({
    queryKey: queryKeys.aircraft.detail(aircraftId || ""),
    queryFn: () => fetchAircraftDetail(aircraftId!),
    enabled: Boolean(aircraftId),
    staleTime: 5000,
    ...options,
  });
}

/**
 * Hook to query waypoint trajectory / track for an aircraft.
 */
export function useAircraftTrackQuery(
  aircraftId?: string | null,
  time?: number,
  options?: Partial<UseQueryOptions<AircraftTrackResponse, Error>>
) {
  return useQuery<AircraftTrackResponse, Error>({
    queryKey: queryKeys.aircraft.track(aircraftId || "", time),
    queryFn: () => fetchAircraftTrack(aircraftId!, time),
    enabled: Boolean(aircraftId),
    staleTime: 10000,
    ...options,
  });
}

/**
 * Hook to query recent AirLabs flight history for an aircraft transponder.
 */
export function useFlightsByAircraftQuery(
  icao24?: string | null,
  options?: Partial<UseQueryOptions<AirLabsFlight[], Error>>
) {
  return useQuery<AirLabsFlight[], Error>({
    queryKey: queryKeys.aircraft.history(icao24 || ""),
    queryFn: () => fetchFlightsByAircraft(icao24!),
    enabled: Boolean(icao24),
    staleTime: 30000,
    ...options,
  });
}

/**
 * Hook to query fleet statistics and metrics.
 */
export function useFleetStatsQuery(
  bbox?: BboxParams,
  options?: Partial<UseQueryOptions<FleetStats, Error>>
) {
  return useQuery<FleetStats, Error>({
    queryKey: queryKeys.fleet.stats(bbox),
    queryFn: () => fetchFleetStats(bbox),
    staleTime: 10000,
    refetchInterval: 15000,
    ...options,
  });
}

/**
 * Hook to query airports list with long TTL caching.
 */
export function useAirportsQuery(
  options?: Partial<UseQueryOptions<Airport[], Error>>
) {
  return useQuery<Airport[], Error>({
    queryKey: queryKeys.airports.all,
    queryFn: fetchAirports,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to query ground radar / ADS-B antennas list with long TTL caching.
 */
export function useAntennasQuery(
  options?: Partial<UseQueryOptions<Antenna[], Error>>
) {
  return useQuery<Antenna[], Error>({
    queryKey: queryKeys.antennas.all,
    queryFn: fetchAntennas,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
