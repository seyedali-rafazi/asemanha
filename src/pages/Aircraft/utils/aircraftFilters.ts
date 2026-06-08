import type { Aircraft } from "../../Home/components/AircraftLayer/types/Aircraft";

export type SortField =
  | "callsign"
  | "airline"
  | "altitude"
  | "speed"
  | "lastUpdate";

export type SortDirection = "asc" | "desc";

export interface AircraftFilters {
  search: string;
  airline: string;
  aircraftType: string;
  minAltitude: number;
  maxAltitude: number;
}

export const DEFAULT_FILTERS: AircraftFilters = {
  search: "",
  airline: "all",
  aircraftType: "all",
  minAltitude: 0,
  maxAltitude: 45000,
};

export function getUniqueAirlines(aircraft: Aircraft[]): string[] {
  return [...new Set(aircraft.map((a) => a.airline))].sort();
}

export function getUniqueTypes(aircraft: Aircraft[]): string[] {
  return [...new Set(aircraft.map((a) => a.aircraftType))].sort();
}

export function filterAircraft(
  aircraft: Aircraft[],
  filters: AircraftFilters
): Aircraft[] {
  const query = filters.search.trim().toLowerCase();

  return aircraft.filter((a) => {
    if (filters.airline !== "all" && a.airline !== filters.airline) {
      return false;
    }
    if (filters.aircraftType !== "all" && a.aircraftType !== filters.aircraftType) {
      return false;
    }
    if (a.altitude_ft < filters.minAltitude || a.altitude_ft > filters.maxAltitude) {
      return false;
    }
    if (!query) return true;

    return (
      a.callsign.toLowerCase().includes(query) ||
      a.id.toLowerCase().includes(query) ||
      a.airline.toLowerCase().includes(query) ||
      a.aircraftType.toLowerCase().includes(query) ||
      a.origin_city.toLowerCase().includes(query) ||
      a.destination_city.toLowerCase().includes(query)
    );
  });
}

export function sortAircraft(
  aircraft: Aircraft[],
  field: SortField,
  direction: SortDirection
): Aircraft[] {
  const sorted = [...aircraft].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "callsign":
        cmp = a.callsign.localeCompare(b.callsign);
        break;
      case "airline":
        cmp = a.airline.localeCompare(b.airline);
        break;
      case "altitude":
        cmp = a.altitude_ft - b.altitude_ft;
        break;
      case "speed":
        cmp = a.speed_kts - b.speed_kts;
        break;
      case "lastUpdate":
        cmp = new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime();
        break;
    }
    return direction === "asc" ? cmp : -cmp;
  });
  return sorted;
}
