import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

export function useStableMapCursor(layerId: string) {
  const { current: mapRef } = useMap();
  const hoveredIdRef = useRef<string | null>(null);
  const leaveTimerRef = useRef<number | null>(null);

  const handleHover = useCallback(
    (item: { id: string } | null) => {
      const map = mapRef?.getMap();
      if (!map) return;

      const nextId = item?.id ?? null;

      if (nextId === hoveredIdRef.current) return;

      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }

      if (nextId) {
        hoveredIdRef.current = nextId;
        map.getCanvas().style.cursor = "pointer";
        return;
      }

      leaveTimerRef.current = window.setTimeout(() => {
        hoveredIdRef.current = null;
        map.getCanvas().style.cursor = "";
        leaveTimerRef.current = null;
      }, 80);
    },
    [mapRef]
  );

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        window.clearTimeout(leaveTimerRef.current);
      }
      const map = mapRef?.getMap();
      if (map) {
        map.getCanvas().style.cursor = "";
      }
    };
  }, [mapRef, layerId]);

  return handleHover;
}
