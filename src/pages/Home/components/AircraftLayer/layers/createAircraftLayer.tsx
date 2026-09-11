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
}

const iconMapping = getAircraftIconMapping();

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
  } = options;

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
      getAngle: (d) => -(d.heading_deg || 0),
      billboard: false,
      autoHighlight: true,
      highlightColor: [242, 201, 76, 200],
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
        getPosition: (d) => [d.lon, d.lat, d.altitude_ft],
        getText: (d) => `${d.altitude_ft.toLocaleString()} ft`,
        getSize: 12,
        getColor: [255, 255, 255, 230],
        getPixelOffset: [0, -(iconSize / 2 + 10)],
        fontFamily: "system-ui, sans-serif",
        fontWeight: 600,
        outlineWidth: 2,
        outlineColor: [15, 17, 19, 200],
        billboard: true,
      })
    );
  }

  return layers;
}
