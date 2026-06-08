import type { Layer } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Map as MapboxMap } from "mapbox-gl";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

function isMapAlive(map: MapboxMap | undefined | null): map is MapboxMap {
  return Boolean(map && !(map as { _removed?: boolean })._removed);
}

export default function DeckGLOverlay({ layers }: { layers: Layer[] }) {
  const { current: mapRef } = useMap();
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const layersRef = useRef(layers);

  layersRef.current = layers;

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!isMapAlive(map)) return;

    const overlay = new MapboxOverlay({ interleaved: true });
    overlayRef.current = overlay;
    map.addControl(overlay);
    overlay.setProps({ layers: layersRef.current });

    const handleResize = () => {
      overlayRef.current?.setProps({ layers: layersRef.current });
    };

    map.on("resize", handleResize);

    return () => {
      map.off("resize", handleResize);
      if (overlayRef.current && isMapAlive(map)) {
        try {
          map.removeControl(overlayRef.current);
        } catch {
          // Map may already be destroyed during route changes.
        }
      }
      overlayRef.current = null;
    };
  }, [mapRef]);

  useEffect(() => {
    overlayRef.current?.setProps({ layers });
  }, [layers]);

  return null;
}
