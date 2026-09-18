import { IconLayer, TextLayer } from "@deck.gl/layers";
import type { Layer } from "@deck.gl/core";
import type { Aircraft } from "../types/Aircraft";
import {
  AIRCRAFT_ATLAS_URL,
  getAircraftIconMapping,
  resolveAircraftIconId,
} from "../utils/resolveAircraftIcon";

interface CreateAircraftLayerOptions {
  onAircraftClick?: (aircraft: Aircraft) => void;
  onAircraftHover?: (aircraft: Aircraft | null) => void;
  iconSize?: number;
  showAltitude?: boolean;
  pickable?: boolean;
  /** Bumps when lat/lon/heading change so Deck re-reads accessors without new data objects. */
  motionVersion?: number;
  /** Bumps only when new telemetry metadata arrives from the API or fleet members change. */
  telemetryVersion?: number;
}

const iconMapping = getAircraftIconMapping();

const altitudeCache = new Map<number, string>();

function formatAltitude(altitude?: number): string {
  if (altitude == null || !Number.isFinite(altitude)) return "0 ft";
  const rounded = Math.round(altitude);
  let formatted = altitudeCache.get(rounded);
  if (!formatted) {
    formatted = `${rounded.toLocaleString()} ft`;
    if (altitudeCache.size > 2000) {
      altitudeCache.clear();
    }
    altitudeCache.set(rounded, formatted);
  }
  return formatted;
}

export function createAircraftIconLayer(
  data: Aircraft[],
  options: CreateAircraftLayerOptions = {}
) {
  const {
    onAircraftClick,
    onAircraftHover,
    iconSize = 30,
    showAltitude = true,
    pickable = true,
    motionVersion = 0,
    telemetryVersion = 0,
  } = options;

  const positionTriggers = { getPosition: motionVersion, getAngle: motionVersion };

  const layers: Layer[] = [
    new IconLayer({
      id: "aircraft-icon-layer",
      data,
      pickable,
      iconAtlas: AIRCRAFT_ATLAS_URL,
      iconMapping,
      getIcon: (d) =>
        resolveAircraftIconId({
          aircraftType: d.aircraftType,
          aircraft_icao: d.aircraft_icao,
          category: d.category,
        }),
      getPosition: (d) => [d.lon, d.lat, d.altitude_ft],
      sizeUnits: "pixels",
      getSize: iconSize,
      // Deck.gl angles are counter-clockwise from up; heading is clockwise from north.
      getAngle: (d) => {
        const heading = Number(d.heading_deg);
        return Number.isFinite(heading) ? -heading : 0;
      },
      billboard: false,
      autoHighlight: true,
      highlightColor: [242, 201, 76, 200],
      updateTriggers: positionTriggers,
      onHover: (info) => {
        if (onAircraftHover) {
          onAircraftHover((info.object as Aircraft) ?? null);
        }
      },
      onClick: (info, event) => {
        if (info.object && onAircraftClick) {
          onAircraftClick(info.object as Aircraft);
        }
        if (event?.srcEvent) {
          event.srcEvent.stopPropagation();
        }
        return true;
      },
    }),
  ];

  if (showAltitude) {
    layers.push(
      new TextLayer({
        id: "aircraft-altitude-layer",
        data,
        pickable: false,
        getPosition: (d) => [d.lon, d.lat, d.altitude_ft ?? 0],
        getText: (d) => formatAltitude(d.altitude_ft),
        getSize: 12,
        sizeUnits: "pixels",
        characterSet: "0123456789, ft—",
        fontSettings: { sdf: true },
        getColor: [255, 255, 255, 230],
        getPixelOffset: [0, -(iconSize / 2 + 10)],
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        fontWeight: 600,
        outlineWidth: 2,
        outlineColor: [15, 17, 19, 200],
        billboard: true,
        updateTriggers: {
          getPosition: motionVersion,
          getText: telemetryVersion,
        },
      })
    );
  }

  return layers;
}
