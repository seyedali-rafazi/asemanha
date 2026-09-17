import type { Aircraft } from "../types/Aircraft";

export interface AircraftSimState {
  lat: number;
  lon: number;
  heading_deg: number;
  segmentIndex: number;
  progress: number;
}

const EARTH_RADIUS_NM = 3440.065;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(a));
}

/** Fast equirectangular distance in nm — accurate enough for short animation steps. */
export function approxNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = (lat2 - lat1) * 60;
  const cosLat = Math.cos(lat1 * DEG_TO_RAD);
  const dLon = (lon2 - lon1) * 60 * cosLat;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export function bearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const lat1r = lat1 * DEG_TO_RAD;
  const lat2r = lat2 * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLon);
  return ((Math.atan2(y, x) * RAD_TO_DEG) + 360) % 360;
}

function interpolateLatLon(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: number
): { lat: number; lon: number } {
  return {
    lat: lat1 + (lat2 - lat1) * t,
    lon: lon1 + (lon2 - lon1) * t,
  };
}

function projectOnSegment(
  lat: number,
  lon: number,
  start: [number, number],
  end: [number, number]
): { lat: number; lon: number; t: number } {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { lat: lat1, lon: lon1, t: 0 };
  }

  const t = Math.max(
    0,
    Math.min(1, ((lon - lon1) * dx + (lat - lat1) * dy) / lenSq)
  );
  const point = interpolateLatLon(lat1, lon1, lat2, lon2, t);
  return { ...point, t };
}

/** Coerce API/path heading to a finite 0–359 value, or null if unknown. */
export function normalizeHeading(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return ((Math.round(n) % 360) + 360) % 360;
}

/** Prefer telemetry heading; fall back to path bearing toward the next waypoint. */
export function resolveHeadingDeg(
  aircraft: Pick<Aircraft, "heading_deg" | "path">,
  lat: number,
  lon: number,
  segmentIndex = 0
): number {
  const fromTelemetry = normalizeHeading(aircraft.heading_deg);
  if (fromTelemetry !== null) return fromTelemetry;

  const route = aircraft.path;
  if (route && route.length >= 2) {
    const seg = Math.min(Math.max(0, segmentIndex), route.length - 2);
    const next = route[seg + 1];
    const fromPath = normalizeHeading(bearingDeg(lat, lon, next[0], next[1]));
    if (fromPath !== null) return fromPath;

    const a = route[route.length - 2];
    const b = route[route.length - 1];
    const fromLast = normalizeHeading(bearingDeg(a[0], a[1], b[0], b[1]));
    if (fromLast !== null) return fromLast;
  }

  return 0;
}

export function initAircraftSim(aircraft: Aircraft): AircraftSimState {
  const route = aircraft.path ?? [];
  if (route.length < 2) {
    return {
      lat: aircraft.lat,
      lon: aircraft.lon,
      heading_deg: resolveHeadingDeg(aircraft, aircraft.lat, aircraft.lon, 0),
      segmentIndex: 0,
      progress: 0,
    };
  }

  let bestDist = Infinity;
  let bestSeg = 0;
  let bestProgress = 0;
  let bestLat = aircraft.lat;
  let bestLon = aircraft.lon;

  for (let i = 0; i < route.length - 1; i++) {
    const projected = projectOnSegment(
      aircraft.lat,
      aircraft.lon,
      route[i],
      route[i + 1]
    );
    const dist = approxNm(
      aircraft.lat,
      aircraft.lon,
      projected.lat,
      projected.lon
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestSeg = i;
      bestProgress = projected.t;
      bestLat = projected.lat;
      bestLon = projected.lon;
    }
  }

  return {
    lat: bestLat,
    lon: bestLon,
    heading_deg: resolveHeadingDeg(aircraft, bestLat, bestLon, bestSeg),
    segmentIndex: bestSeg,
    progress: bestProgress,
  };
}

/**
 * Advance simulation by mutating `state` in place (avoids per-frame allocations).
 */
export function advanceAircraftSimInPlace(
  state: AircraftSimState,
  route: [number, number][],
  speedKts: number,
  deltaSeconds: number
): void {
  let distanceNm = (speedKts / 3600) * deltaSeconds;
  if (distanceNm <= 0) {
    // Still align nose when stopped / zero-speed updates.
    if (route.length >= 2 && state.segmentIndex < route.length - 1) {
      const next = route[state.segmentIndex + 1];
      const h = normalizeHeading(
        bearingDeg(state.lat, state.lon, next[0], next[1])
      );
      if (h !== null) state.heading_deg = h;
    } else if (!Number.isFinite(state.heading_deg)) {
      state.heading_deg = 0;
    }
    return;
  }

  let { lat, lon, segmentIndex, progress, heading_deg } = state;
  if (!Number.isFinite(heading_deg)) heading_deg = 0;

  if (route.length >= 2 && segmentIndex < route.length - 1) {
    while (distanceNm > 0 && segmentIndex < route.length - 1) {
      const [lat1, lon1] = route[segmentIndex];
      const [lat2, lon2] = route[segmentIndex + 1];
      const segLen = approxNm(lat1, lon1, lat2, lon2);

      if (segLen === 0) {
        segmentIndex++;
        progress = 0;
        continue;
      }

      const remainingOnSeg = segLen * (1 - progress);

      if (distanceNm >= remainingOnSeg) {
        distanceNm -= remainingOnSeg;
        lat = lat2;
        lon = lon2;
        segmentIndex++;
        progress = 0;

        if (segmentIndex >= route.length - 1) {
          break;
        }
      } else {
        progress += distanceNm / segLen;
        lat = lat1 + (lat2 - lat1) * progress;
        lon = lon1 + (lon2 - lon1) * progress;
        distanceNm = 0;
      }
    }

    // Keep nose aligned with the active path segment.
    if (segmentIndex < route.length - 1) {
      const nextIdx = segmentIndex + 1;
      const computedHeading = normalizeHeading(
        bearingDeg(lat, lon, route[nextIdx][0], route[nextIdx][1])
      );
      if (computedHeading !== null) {
        heading_deg = computedHeading;
      }
    }
  }

  if (distanceNm > 0) {
    const headingRad = heading_deg * DEG_TO_RAD;
    const dLat = (distanceNm / 60) * Math.cos(headingRad);
    const cosLat = Math.max(0.01, Math.cos(lat * DEG_TO_RAD));
    const dLon = (distanceNm / (60 * cosLat)) * Math.sin(headingRad);
    lat += dLat;
    lon += dLon;
  }

  state.lat = lat;
  state.lon = lon;
  state.heading_deg = heading_deg;
  state.segmentIndex =
    route.length >= 2 ? Math.min(segmentIndex, route.length - 2) : 0;
  state.progress = Math.min(1, Math.max(0, progress));
}

/** Immutable wrapper kept for callers that expect a new object. */
export function advanceAircraftSim(
  state: AircraftSimState,
  route: [number, number][],
  speedKts: number,
  deltaSeconds: number
): AircraftSimState {
  const next: AircraftSimState = { ...state };
  advanceAircraftSimInPlace(next, route, speedKts, deltaSeconds);
  return next;
}

export function formatHeading(heading: number): number {
  return Math.round(heading) % 360;
}

/** Build track polyline in [lon, lat, altitude_ft] order, ending at the aircraft. */
export function buildTrackPath(
  aircraft: Aircraft,
  sim?: AircraftSimState
): [number, number, number][] {
  const route = aircraft.path;
  if (route.length === 0) {
    return [[aircraft.lon, aircraft.lat, aircraft.altitude_ft]];
  }

  const position = sim ?? {
    lat: aircraft.lat,
    lon: aircraft.lon,
    segmentIndex: route.length - 2,
    progress: 1,
    heading_deg: aircraft.heading_deg,
  };

  const horizontal: [number, number][] = [[route[0][1], route[0][0]]];

  for (let i = 0; i < position.segmentIndex; i++) {
    horizontal.push([route[i + 1][1], route[i + 1][0]]);
  }

  horizontal.push([position.lon, position.lat]);

  if (horizontal.length === 1) {
    return [[horizontal[0][0], horizontal[0][1], aircraft.altitude_ft]];
  }

  const lastIndex = horizontal.length - 1;
  return horizontal.map((point, index) => {
    const altitude =
      index === lastIndex
        ? aircraft.altitude_ft
        : Math.round((index / lastIndex) * aircraft.altitude_ft);
    return [point[0], point[1], altitude];
  });
}
