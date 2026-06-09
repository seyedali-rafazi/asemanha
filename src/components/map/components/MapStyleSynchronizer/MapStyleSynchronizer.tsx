import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useAppSelector } from "../../../../store/hooks";
import { getMapStyleUrl } from "../../../../store/mapStyles";

/**
 * Applies map style changes from Redux without resetting camera position.
 * The Map component keeps a fixed initial mapStyle prop to avoid double setStyle calls.
 */
export default function MapStyleSynchronizer() {
  const { current } = useMap();
  const mapStyleId = useAppSelector((state) => state.settings.mapStyleId);
  const activeStyleIdRef = useRef(mapStyleId);

  useEffect(() => {
    const map = current?.getMap();
    if (!map) return;

    if (mapStyleId === activeStyleIdRef.current) return;

    // Mark the target style as applied immediately. mapbox-gl skips the
    // `style.load` event when it can diff two styles in place, so relying on
    // that event to update this ref would leave it desynced and cause later
    // style switches to be incorrectly short-circuited.
    activeStyleIdRef.current = mapStyleId;

    const nextStyle = getMapStyleUrl(mapStyleId);
    const camera = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bearing: 0,
      pitch: 0,
    };

    const handleStyleLoad = () => {
      try {
        map.setProjection("mercator");
      } catch {
        // Ignore if projection cannot be set on this style.
      }

      map.jumpTo(camera);
      map.dragRotate.disable();
      map.touchPitch?.disable();

      // Notify deck.gl overlay to refresh after projection/camera are restored.
      map.fire("ase:style-ready");
    };

    map.once("style.load", handleStyleLoad);
    // Force a full reload (diff: false) so `style.load` always fires and the
    // tool layers/sources get cleanly re-initialised on every switch.
    map.setStyle(nextStyle, { diff: false });

    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [current, mapStyleId]);

  return null;
}
