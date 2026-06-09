import type { Aircraft } from "../types/Aircraft";

export interface AircraftSimState {
  lat: number;
  lon: number;
  heading_deg: number;
  segmentIndex: number;
  progress: number;
}

const EARTH_RADIUS_NM = 3440.065;

export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(a));
}

export function bearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const lat1r = toRad(lat1);
  const lat2r = toRad(lat2);
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(lat2r);
  const x =
    Math.cos(lat1r) * Math.sin(lat2r) -
    Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
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

export function initAircraftSim(aircraft: Aircraft): AircraftSimState {
  const route = aircraft.path;
  if (route.length < 2) {
    return {
      lat: aircraft.lat,
      lon: aircraft.lon,
      heading_deg: aircraft.heading_deg,
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
    const dist = haversineNm(
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

  const next = route[Math.min(bestSeg + 1, route.length - 1)];
  return {
    lat: bestLat,
    lon: bestLon,
    heading_deg: formatHeading(bearingDeg(bestLat, bestLon, next[0], next[1])),
    segmentIndex: bestSeg,
    progress: bestProgress,
  };
}

export function advanceAircraftSim(
  state: AircraftSimState,
  route: [number, number][],
  speedKts: number,
  deltaSeconds: number
): AircraftSimState {
  if (route.length < 2) {
    return state;
  }

  let distanceNm = (speedKts / 3600) * deltaSeconds;
  let { lat, lon, segmentIndex, progress } = state;

  while (distanceNm > 0 && segmentIndex < route.length - 1) {
    const [lat1, lon1] = route[segmentIndex];
    const [lat2, lon2] = route[segmentIndex + 1];
    const segLen = haversineNm(lat1, lon1, lat2, lon2);

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
      const next = interpolateLatLon(lat1, lon1, lat2, lon2, progress);
      lat = next.lat;
      lon = next.lon;
      distanceNm = 0;
    }
  }

  const nextIdx = Math.min(segmentIndex + 1, route.length - 1);
  const heading = bearingDeg(
    lat,
    lon,
    route[nextIdx][0],
    route[nextIdx][1]
  );

  return {
    lat,
    lon,
    heading_deg: Math.round(heading) % 360,
    segmentIndex: Math.min(segmentIndex, route.length - 2),
    progress,
  };
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
