import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

function resizeMap(map: MapboxMap) {
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
      }, 50);
    };

    const container = map.getContainer();
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(container);

    const handleSidebarResize = () => scheduleResize();
    window.addEventListener("sidebar-resize", handleSidebarResize);
    window.addEventListener("resize", handleSidebarResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("sidebar-resize", handleSidebarResize);
      window.removeEventListener("resize", handleSidebarResize);
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [mapRef]);

  return null;
}
