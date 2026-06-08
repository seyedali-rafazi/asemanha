import { useEffect } from "react";
import { useMap } from "react-map-gl/mapbox";

/** Keeps the map flat (rectangular mercator) — no globe or 3D tilt. */
export default function MapFlatViewEnforcer() {
  const { current } = useMap();

  useEffect(() => {
    const map = current?.getMap();
    if (!map) return;

    const enforceFlatView = () => {
      try {
        map.setProjection("mercator");
      } catch {
        // Projection API may vary between mapbox-gl versions.
      }

      map.setPitch(0);
      map.setBearing(0);
      map.dragRotate.disable();
      map.touchPitch?.disable();
    };

    enforceFlatView();
    map.on("style.load", enforceFlatView);

    return () => {
      map.off("style.load", enforceFlatView);
    };
  }, [current]);

  return null;
}
