import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Aircraft } from "../types/Aircraft";

function toLonLatPath(path: [number, number][]): [number, number][] {
  return path.map(([lat, lon]) => [lon, lat]);
}

export function createFlightPathLayer(aircraft: Aircraft) {
  const pathCoords = toLonLatPath(aircraft.path);
  if (pathCoords.length < 2) return null;

  const startPoint = pathCoords[0];
  const endPoint = pathCoords[pathCoords.length - 1];

  const pathLayer = new PathLayer({
    id: `flight-path-${aircraft.id}`,
    data: [{ path: pathCoords }],
    pickable: false,
    widthUnits: "pixels",
    getPath: (d) => d.path,
    getColor: [25, 181, 254, 220],
    getWidth: 4,
    capRounded: true,
    jointRounded: true,
  });

  const endpointsLayer = new ScatterplotLayer({
    id: `flight-path-endpoints-${aircraft.id}`,
    data: [
      { position: startPoint, type: "start" },
      { position: endPoint, type: "end" },
    ],
    pickable: false,
    getPosition: (d) => d.position,
    getFillColor: (d) =>
      d.type === "start" ? [34, 197, 94, 255] : [239, 68, 68, 255],
    getRadius: 8,
    radiusUnits: "pixels",
    stroked: true,
    getLineColor: [255, 255, 255, 200],
    lineWidthUnits: "pixels",
    getLineWidth: 2,
  });

  return [pathLayer, endpointsLayer];
}
