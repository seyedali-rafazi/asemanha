import { useCallback, useLayoutEffect, useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import {
  getPopupScreenPosition,
  POPUP_HEIGHT,
  POPUP_WIDTH,
  type PopupScreenPosition,
} from "../utils/getPopupScreenPosition";

export function usePopupScreenPosition(
  lonLat: { lon: number; lat: number } | null
) {
  const { current: mapRef } = useMap();
  const [position, setPosition] = useState<PopupScreenPosition | null>(null);

  const updatePosition = useCallback(() => {
    const map = mapRef?.getMap();
    if (!map || !lonLat) {
      setPosition(null);
      return;
    }
    setPosition(
      getPopupScreenPosition(map, lonLat.lon, lonLat.lat, POPUP_WIDTH, POPUP_HEIGHT)
    );
  }, [mapRef, lonLat]);

  useLayoutEffect(() => {
    if (!lonLat) {
      setPosition(null);
      return;
    }

    updatePosition();

    const map = mapRef?.getMap();
    if (!map) return;

    map.on("move", updatePosition);
    map.on("zoom", updatePosition);
    map.on("resize", updatePosition);

    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
      map.off("resize", updatePosition);
    };
  }, [lonLat, mapRef, updatePosition]);

  return position;
}
