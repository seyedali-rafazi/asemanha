import type { Layer } from "@deck.gl/core";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { Map as MapboxMap } from "mapbox-gl";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useAppSelector } from "../../../../store/hooks";

function isMapAlive(map: MapboxMap | undefined | null): map is MapboxMap {
  return Boolean(map && !(map as { _removed?: boolean })._removed);
}

function isOverlayAttached(map: MapboxMap, overlay: MapboxOverlay) {
  const controls = (map as MapboxMap & { _controls?: MapboxOverlay[] })._controls;
  return Boolean(controls?.includes(overlay));
}

function attachOverlay(map: MapboxMap, layers: Layer[]) {
  const overlay = new MapboxOverlay({ interleaved: true });
  map.addControl(overlay);
  overlay.setProps({ layers });
  return overlay;
}

export default function DeckGLOverlay({ layers }: { layers: Layer[] }) {
  const { current: mapRef } = useMap();
  const mapStyleId = useAppSelector((state) => state.settings.mapStyleId);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const layersRef = useRef(layers);

  layersRef.current = layers;

  const ensureOverlay = useCallback(() => {
    const map = mapRef?.getMap();
    if (!isMapAlive(map)) return;

    const current = overlayRef.current;
    const needsAttach = !current || !isOverlayAttached(map, current);

    if (needsAttach) {
      if (current) {
        try {
          map.removeControl(current);
        } catch {
          // Control may already be detached.
        }
      }
      overlayRef.current = attachOverlay(map, layersRef.current);
      return;
    }

    current.setProps({ layers: layersRef.current });
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!isMapAlive(map)) return;

    overlayRef.current = attachOverlay(map, layersRef.current);

    const handleResize = () => {
      overlayRef.current?.setProps({ layers: layersRef.current });
    };

    const handleStyleReady = () => {
      requestAnimationFrame(() => {
        ensureOverlay();
      });
    };

    map.on("resize", handleResize);
    map.on("ase:style-ready", handleStyleReady);

    return () => {
      map.off("resize", handleResize);
      map.off("ase:style-ready", handleStyleReady);
      if (overlayRef.current && isMapAlive(map)) {
        try {
          map.removeControl(overlayRef.current);
        } catch {
          // Map may already be destroyed during route changes.
        }
      }
      overlayRef.current = null;
    };
  }, [mapRef, ensureOverlay]);

  useEffect(() => {
    ensureOverlay();
  }, [layers, ensureOverlay]);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!isMapAlive(map)) return;

    const refresh = () => ensureOverlay();

    map.once("ase:style-ready", refresh);
    map.once("idle", refresh);

    const timer = window.setTimeout(refresh, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [mapStyleId, mapRef, ensureOverlay]);

  return null;
}
