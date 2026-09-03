import type { Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

function isMapAlive(map: MapLibreMap | undefined | null): map is MapLibreMap {
  return Boolean(map && !(map as { _removed?: boolean })._removed);
}

function setMapCursor(map: MapLibreMap, cursor: string) {
  if (!isMapAlive(map)) return;
  const canvas = map.getCanvas();
  if (!canvas?.style) return;
  canvas.style.cursor = cursor;
}

export function useStableMapCursor(layerId: string) {
  const { current: mapRef } = useMap();
  const hoveredIdRef = useRef<string | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const handleHover = useCallback(
    (item: { id: string } | null) => {
      const map = mapRef?.getMap();
      if (!isMapAlive(map)) return;

      const nextId = item?.id ?? null;

      if (nextId === hoveredIdRef.current) return;

      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      if (nextId) {
        hoveredIdRef.current = nextId;
        setMapCursor(map, "pointer");
        return;
      }

      leaveTimerRef.current = window.setTimeout(() => {
        hoveredIdRef.current = null;
        setMapCursor(map, "");
        leaveTimerRef.current = null;
      }, 80);
    },
    [mapRef]
  );

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      setMapCursor(mapRef?.getMap(), "");
    };
  }, [mapRef, layerId]);

  return handleHover;
}
