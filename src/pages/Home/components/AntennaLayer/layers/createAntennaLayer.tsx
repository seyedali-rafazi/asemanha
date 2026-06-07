import { IconLayer } from "@deck.gl/layers";
import type { Antenna } from "../types/Antenna";

interface CreateAntennaLayerOptions {
  onAntennaClick?: (antenna: Antenna) => void;
  onAntennaHover?: (antenna: Antenna | null) => void;
}

export function createAntennaLayer(
  data: Antenna[],
  options: CreateAntennaLayerOptions = {}
) {
  const { onAntennaClick, onAntennaHover } = options;

  const antennaSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect x="46" y="55" width="8" height="35" fill="#64748b"/>
    <polygon points="50,10 62,55 38,55" fill="#a78bfa" stroke="#7c3aed" stroke-width="2"/>
    <circle cx="50" cy="18" r="5" fill="#fbbf24"/>
    <path d="M30 30 Q50 5 70 30" fill="none" stroke="#c4b5fd" stroke-width="2"/>
    <path d="M25 38 Q50 12 75 38" fill="none" stroke="#c4b5fd" stroke-width="2"/>
  </svg>`;

  const iconUrl =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(antennaSVG.trim());

  return new IconLayer({
    id: "antenna-icon-layer",
    data,
    pickable: true,
    iconAtlas: iconUrl,
    iconMapping: {
      antenna: { x: 0, y: 0, width: 100, height: 100, anchorX: 50, anchorY: 50 },
    },
    getIcon: () => "antenna",
    getPosition: (d) => [d.lon, d.lat, 0],
    sizeUnits: "pixels",
    getSize: 26,
    billboard: true,
    autoHighlight: true,
    highlightColor: [167, 139, 250, 180],
    onHover: (info) => {
      if (onAntennaHover) {
        onAntennaHover((info.object as Antenna) ?? null);
      }
    },
    onClick: (info, event) => {
      if (info.object && onAntennaClick) {
        onAntennaClick(info.object as Antenna);
      }
      if (event?.srcEvent) {
        event.srcEvent.stopPropagation();
      }
      return true;
    },
  });
}
