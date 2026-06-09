import { useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";

export default function MapActivityController({ active }: { active: boolean }) {
  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || (map as { _removed?: boolean })._removed) return;

    if (active) {
      map.resize();
    } else {
      map.stop();
    }
  }, [active, mapRef]);

  return null;
}
