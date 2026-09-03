import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useLiveAircraftEngine } from "../../../../pages/Home/components/AircraftLayer/context/LiveAircraftContext";
import type { BboxParams } from "../../../../services/types";

/**
 * Synchronizes the MapLibre viewport (bounding box and zoom)
 * with the live aircraft fetching engine and React Query.
 *
 * Trailing debounce ensures:
 * 1. ZERO requests while actively moving, dragging, or zooming.
 * 2. An immediate request (~150-200ms) with the exact new lat/lon bounds
 *    once movement, zoom, or screen resizing STOPS.
 */
export default function MapViewportSync() {
  const { current: mapRef } = useMap();
  const { updateViewport } = useLiveAircraftEngine();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const cancelTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const emitViewport = () => {
      cancelTimer();

      if ((map as { _removed?: boolean })._removed) return;

      try {
        const bounds = map.getBounds();
        if (!bounds) return;

        const zoom = Number(map.getZoom().toFixed(1));
        const south = bounds.getSouth();
        const north = bounds.getNorth();
        const west = bounds.getWest();
        const east = bounds.getEast();

        const lamin = Number(Math.max(-85, Math.min(85, Math.min(south, north))).toFixed(4));
        const lamax = Number(Math.max(-85, Math.min(85, Math.max(south, north))).toFixed(4));

        let lomin: number;
        let lomax: number;

        if (east - west >= 360) {
          lomin = -180;
          lomax = 180;
        } else {
          // Wrap longitudes correctly into standard [-180, 180] range
          const wrapLng = (lng: number) => {
            const w = ((lng + 180) % 360 + 360) % 360 - 180;
            return w === -180 && lng > 0 ? 180 : w;
          };
          const normWest = wrapLng(west);
          const normEast = wrapLng(east);

          lomin = Number(Math.min(normWest, normEast).toFixed(4));
          lomax = Number(Math.max(normWest, normEast).toFixed(4));
        }

        const bbox: BboxParams = {
          lamin,
          lamax,
          lomin,
          lomax,
          zoom,
        };

        updateViewport(bbox, zoom);
      } catch (err) {
        console.warn("[MapViewportSync] Failed to calculate map bounds:", err);
      }
    };

    // Trailing debounce: resets timer continuously while moving/zooming
    const scheduleEmit = (delayMs: number = 250) => {
      cancelTimer();
      timerRef.current = window.setTimeout(emitViewport, delayMs);
    };

    const onMotion = () => {
      scheduleEmit(250);
    };

    const onMotionEnd = () => {
      scheduleEmit(150);
    };

    // Initial emit on load
    if (map.isStyleLoaded()) {
      emitViewport();
    } else {
      map.once("load", emitViewport);
    }

    // Motion events (resets timer continuously so no requests fire during motion)
    map.on("movestart", onMotion);
    map.on("move", onMotion);
    map.on("zoomstart", onMotion);
    map.on("zoom", onMotion);
    map.on("dragstart", onMotion);
    map.on("drag", onMotion);

    // End events (fires after motion stops)
    map.on("moveend", onMotionEnd);
    map.on("zoomend", onMotionEnd);
    map.on("dragend", onMotionEnd);

    // Screen / window size change
    map.on("resize", onMotion);
    window.addEventListener("resize", onMotion);

    return () => {
      cancelTimer();
      map.off("movestart", onMotion);
      map.off("move", onMotion);
      map.off("zoomstart", onMotion);
      map.off("zoom", onMotion);
      map.off("dragstart", onMotion);
      map.off("drag", onMotion);

      map.off("moveend", onMotionEnd);
      map.off("zoomend", onMotionEnd);
      map.off("dragend", onMotionEnd);

      map.off("resize", onMotion);
      window.removeEventListener("resize", onMotion);
    };
  }, [mapRef, updateViewport]);

  return null;
}



