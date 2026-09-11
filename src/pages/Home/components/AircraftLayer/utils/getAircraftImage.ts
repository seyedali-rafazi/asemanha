import {
  AIRCRAFT_ATLAS_URL,
  resolveAircraftIconId,
} from "./resolveAircraftIcon";

/**
 * Returns a URL usable as an <img> src for a given aircraft type.
 * For map rendering prefer the atlas + resolveAircraftIconId instead.
 */
export function getAircraftImage(aircraftType: string): string {
  const iconId = resolveAircraftIconId({ aircraftType });
  // Point at the atlas; consumers that need a single-tile URL should use the atlas mapping.
  void iconId;
  return AIRCRAFT_ATLAS_URL;
}
