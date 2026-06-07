import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useMap } from "react-map-gl/mapbox";

export default function DeckGLOverlay({ layers }) {
  const { current: mapRef } = useMap();
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    if (!overlayRef.current) {
      overlayRef.current = new MapboxOverlay({
        interleaved: true,
      });
      map.addControl(overlayRef.current);
    }

    overlayRef.current.setProps({ layers });
  }, [mapRef, layers]);

  useEffect(() => {
    const map = mapRef?.getMap();
    return () => {
      if (overlayRef.current && map) {
        map.removeControl(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [mapRef]);

  return null;
}
