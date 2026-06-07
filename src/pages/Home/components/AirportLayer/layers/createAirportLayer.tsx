import { IconLayer } from "@deck.gl/layers";
import type { Airport } from "../types/Airport";

interface CreateAirportLayerOptions {
  onAirportClick?: (airport: Airport) => void;
  onAirportHover?: (airport: Airport | null) => void;
}

export function createAirportLayer(
  data: Airport[],
  options: CreateAirportLayerOptions = {}
) {
  const { onAirportClick, onAirportHover } = options;

  const airportSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="#1e3a5f" stroke="#60a5fa" stroke-width="3"/>
    <path d="M50 22 L58 42 L78 46 L58 50 L50 70 L42 50 L22 46 L42 42 Z" fill="#93c5fd"/>
    <rect x="46" y="68" width="8" height="14" rx="2" fill="#60a5fa"/>
  </svg>`;

  const iconUrl =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(airportSVG.trim());

  return new IconLayer({
    id: "airport-icon-layer",
    data,
    pickable: true,
    iconAtlas: iconUrl,
    iconMapping: {
      airport: { x: 0, y: 0, width: 100, height: 100, anchorX: 50, anchorY: 50 },
    },
    getIcon: () => "airport",
    getPosition: (d) => [d.lon, d.lat, 0],
    sizeUnits: "pixels",
    getSize: 28,
    billboard: true,
    autoHighlight: true,
    highlightColor: [96, 165, 250, 180],
    onHover: (info) => {
      if (onAirportHover) {
        onAirportHover((info.object as Airport) ?? null);
      }
    },
    onClick: (info, event) => {
      if (info.object && onAirportClick) {
        onAirportClick(info.object as Airport);
      }
      if (event?.srcEvent) {
        event.srcEvent.stopPropagation();
      }
      return true;
    },
  });
}
