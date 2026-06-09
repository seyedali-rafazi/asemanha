import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Aircraft } from "../types/Aircraft";
import { buildTrackPath } from "../utils/aircraftMovement";

type TrackPoint = [number, number, number];

export function createFlightPathLayer(
  aircraft: Aircraft,
  trackPath?: TrackPoint[]
) {
  const pathCoords = trackPath ?? buildTrackPath(aircraft);
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
    updateTriggers: {
      getPath: pathCoords,
    },
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
      d.type === "start" ? [34, 197, 94, 255] : [255, 204, 0, 255],
    getRadius: 6,
    radiusUnits: "pixels",
    stroked: true,
    getLineColor: [255, 255, 255, 200],
    lineWidthUnits: "pixels",
    getLineWidth: 2,
  });

  return [pathLayer, endpointsLayer];
}
