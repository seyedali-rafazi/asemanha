import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useLiveAircraftEngine } from "../../../../pages/Home/components/AircraftLayer/context/LiveAircraftContext";
import type { BboxParams } from "../../../../services/types";

/**
 * Synchronizes the Mapbox viewport (bounding box and zoom)
 * with the live aircraft fetching engine and React Query.
 */
export default function MapViewportSync() {
  const { current: mapRef } = useMap();
  const { updateViewport } = useLiveAircraftEngine();
  const lastBboxRef = useRef<string>("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const emitViewport = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      try {
        const bounds = map.getBounds();
        if (!bounds) return;

        const zoom = Number(map.getZoom().toFixed(1));
        const south = Number(Math.max(-85, Math.min(85, bounds.getSouth())).toFixed(2));
        const north = Number(Math.max(-85, Math.min(85, bounds.getNorth())).toFixed(2));

        const rawWest = bounds.getWest();
        const rawEast = bounds.getEast();

        let lomin: number;
        let lomax: number;

        if (rawEast - rawWest >= 360) {
          lomin = -180;
          lomax = 180;
        } else {
          // Normalize within [-180, 180]
          lomin = Number(Math.max(-180, Math.min(180, rawWest)).toFixed(2));
          lomax = Number(Math.max(-180, Math.min(180, rawEast)).toFixed(2));
        }

        const bbox: BboxParams = {
          lamin: Math.min(south, north),
          lamax: Math.max(south, north),
          lomin: Math.min(lomin, lomax),
          lomax: Math.max(lomin, lomax),
          zoom,
        };

        const key = `${bbox.lamin},${bbox.lomin},${bbox.lamax},${bbox.lomax},${zoom}`;
        if (lastBboxRef.current === key) return;
        lastBboxRef.current = key;

        updateViewport(bbox, zoom);
      } catch (err) {
        console.warn("[MapViewportSync] Failed to calculate map bounds:", err);
      }
    };

    const debouncedEmit = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(emitViewport, 250);
    };

    // Emit immediately when map is ready
    if (map.isStyleLoaded()) {
      emitViewport();
    } else {
      map.once("load", emitViewport);
    }

    // Immediate query on gesture completion
    map.on("moveend", emitViewport);
    map.on("zoomend", emitViewport);
    map.on("dragend", emitViewport);

    // Debounced emit during active dragging/panning
    map.on("move", debouncedEmit);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      map.off("moveend", emitViewport);
      map.off("zoomend", emitViewport);
      map.off("dragend", emitViewport);
      map.off("move", debouncedEmit);
    };
  }, [mapRef, updateViewport]);

  return null;
}
