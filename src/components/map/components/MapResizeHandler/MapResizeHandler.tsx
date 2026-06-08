import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

function resizeMap(map: MapboxMap) {
  if ((map as { _removed?: boolean })._removed) return;

  const container = map.getContainer();
  if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
    return;
  }

  map.resize();
}

export default function MapResizeHandler() {
  const { current: mapRef } = useMap();
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const scheduleResize = () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        resizeMap(map);
        debounceRef.current = null;
      }, 150);
    };

    window.addEventListener("resize", scheduleResize);

    return () => {
      window.removeEventListener("resize", scheduleResize);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [mapRef]);

  return null;
}
