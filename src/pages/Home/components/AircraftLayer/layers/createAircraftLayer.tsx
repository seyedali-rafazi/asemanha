import { IconLayer } from "@deck.gl/layers";
import type { Aircraft } from "../types/Aircraft";

interface CreateAircraftLayerOptions {
  onAircraftClick?: (aircraft: Aircraft) => void;
  onAircraftHover?: (aircraft: Aircraft | null) => void;
}

export function createAircraftIconLayer(
  data: Aircraft[],
  options: CreateAircraftLayerOptions = {}
) {
  const { onAircraftClick, onAircraftHover } = options;

  const aircraftSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="2" result="offset-blur"/>
        <feGaussianBlur in="offset-blur" stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="
        M 50 10
        C 54 10, 56 14, 56 20
        L 56 40
        L 90 60
        L 90 68
        L 56 60
        L 56 82
        L 72 90
        L 72 94
        L 56 92
        L 52 98
        L 48 98
        L 44 92
        L 28 94
        L 28 90
        L 44 82
        L 44 60
        L 10 68
        L 10 60
        L 44 40
        L 44 20
        C 44 14, 46 10, 50 10
        Z
      " fill="#f2fa0aff" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="62" y="42" width="4" height="12" rx="1.5" fill="#64748b" />
      <rect x="34" y="42" width="4" height="12" rx="1.5" fill="#64748b" />
      <path d="M 46.5 19 Q 50 16 53.5 19 L 52.5 21 Q 50 18.5 47.5 21 Z" fill="#1e293b"/>
      <line x1="56" y1="57" x2="88" y2="65" stroke="#94a3b8" stroke-width="1" stroke-linecap="round"/>
      <line x1="44" y1="57" x2="12" y2="65" stroke="#94a3b8" stroke-width="1" stroke-linecap="round"/>
      <polygon points="49,80 51,80 51,97 49,97" fill="#64748b" />
    </g>
  </svg>`;

  const iconUrl =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(aircraftSVG.trim());

  return new IconLayer({
    id: "aircraft-icon-layer",
    data,
    pickable: true,
    iconAtlas: iconUrl,
    iconMapping: {
      plane: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        anchorX: 50,
        anchorY: 50,
      },
    },
    getIcon: () => "plane",
    getPosition: (d) => [d.lon, d.lat, d.altitude_ft],
    sizeUnits: "pixels",
    getSize: 30,
    getAngle: (d) => -(d.heading_deg || 0),
    billboard: false,
    autoHighlight: true,
    highlightColor: [242, 250, 10, 200],
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
  });
}
