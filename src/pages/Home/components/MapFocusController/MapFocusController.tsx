import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useLiveAircraftEngine } from "../AircraftLayer/context/LiveAircraftContext";
import { useMapLayers } from "../../context/MapLayersContext";

const FOCUS_ZOOM = 7;

export default function MapFocusController() {
  const { current: mapRef } = useMap();
  const { focusRequest, getEntityData } = useMapLayers();
  const { getAircraftById } = useLiveAircraftEngine();
  const lastNonceRef = useRef(0);

  useEffect(() => {
    if (!focusRequest || focusRequest.nonce === lastNonceRef.current) return;

    const map = mapRef?.getMap();
    if (!map || (map as { _removed?: boolean })._removed) return;

    let coords: { lon: number; lat: number } | null = null;
    if (focusRequest.category === "airplanes") {
      const live = getAircraftById(focusRequest.id);
      const fallback = getEntityData("airplanes", focusRequest.id);
      const aircraft = live ?? fallback;
      if (aircraft) coords = { lon: aircraft.lon, lat: aircraft.lat };
    } else {
      const entity = getEntityData(focusRequest.category, focusRequest.id);
      if (entity && "lat" in entity && "lon" in entity) {
        coords = { lon: entity.lon, lat: entity.lat };
      }
    }

    if (!coords) return;

    lastNonceRef.current = focusRequest.nonce;
    map.flyTo({
      center: [coords.lon, coords.lat],
      zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
      duration: 1600,
      essential: true,
    });
  }, [focusRequest, mapRef, getAircraftById, getEntityData]);

  return null;
}
