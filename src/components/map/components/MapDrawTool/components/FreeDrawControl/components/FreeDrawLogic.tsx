import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import type { MapTool } from "../../../../../types/MapTypes";

interface FreeDrawLogicProps {
  isDrawingMode: boolean;
  lineColor: string;
  lineWidth: number;
  activeTool: MapTool;
  setIsDrawingMode: (value: boolean) => void;
}

const MIN_POINT_DISTANCE_PX = 3;

const FreeDrawLogic = ({
  isDrawingMode,
  lineColor,
  lineWidth,
  activeTool,
  setIsDrawingMode,
}: FreeDrawLogicProps) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const isDrawingMapRef = useRef(false);
  const currentCoordinatesRef = useRef<number[][]>([]);
  const geojsonRef = useRef({
    type: "FeatureCollection" as const,
    features: [] as GeoJSON.Feature[],
  });

  const lineColorRef = useRef(lineColor);
  const lineWidthRef = useRef(lineWidth);
  lineColorRef.current = lineColor;
  lineWidthRef.current = lineWidth;

  useEffect(() => {
    if (activeTool && activeTool !== "freedraw") {
      setIsDrawingMode(false);
    }
  }, [activeTool, setIsDrawingMode]);

  const ensureFreedrawLayers = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return false;

    if (!map.getSource("custom-freedraw-source")) {
      map.addSource("custom-freedraw-source", {
        type: "geojson",
        data: geojsonRef.current,
      });
    }

    if (!map.getLayer("custom-freedraw-layer")) {
      map.addLayer({
        id: "custom-freedraw-layer",
        type: "line",
        source: "custom-freedraw-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
        },
      });
    }

    return true;
  }, [map]);

  const renderFeatures = useCallback(
    (liveCoords?: number[][]) => {
      if (!map) return;
      ensureFreedrawLayers();

      const source = map.getSource("custom-freedraw-source") as
        | mapboxgl.GeoJSONSource
        | undefined;
      if (!source) return;

      const features = [...geojsonRef.current.features];

      if (liveCoords && liveCoords.length >= 2) {
        features.push({
          type: "Feature",
          properties: {
            color: lineColorRef.current,
            width: lineWidthRef.current,
          },
          geometry: {
            type: "LineString",
            coordinates: liveCoords,
          },
        });
      }

      source.setData({
        type: "FeatureCollection",
        features,
      });
    },
    [map, ensureFreedrawLayers]
  );

  const syncSavedStrokes = useCallback(() => {
    renderFeatures();
  }, [renderFeatures]);

  useEffect(() => {
    if (!map) return;

    const handleStyleLoad = () => {
      ensureFreedrawLayers();
      syncSavedStrokes();
    };

    if (map.isStyleLoaded()) {
      ensureFreedrawLayers();
    }

    map.on("style.load", handleStyleLoad);

    return () => {
      map.off("style.load", handleStyleLoad);
    };
  }, [map, ensureFreedrawLayers, syncSavedStrokes]);

  useEffect(() => {
    if (!map) return;

    const shouldAddPoint = (lng: number, lat: number) => {
      const coords = currentCoordinatesRef.current;
      if (coords.length === 0) return true;

      const last = coords[coords.length - 1];
      const lastPoint = map.project([last[0], last[1]]);
      const nextPoint = map.project([lng, lat]);
      return (
        Math.hypot(lastPoint.x - nextPoint.x, lastPoint.y - nextPoint.y) >=
        MIN_POINT_DISTANCE_PX
      );
    };

    const pointerToLngLat = (clientX: number, clientY: number) => {
      const canvas = map.getCanvas();
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return map.unproject([x, y]);
    };

    const disableMapInteractions = () => {
      map.dragPan.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.keyboard.disable();
    };

    const enableMapInteractions = () => {
      map.dragPan.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.scrollZoom.enable();
      map.dragRotate.enable();
      map.keyboard.enable();
    };

    const finishStroke = () => {
      if (!isDrawingMapRef.current) return;

      isDrawingMapRef.current = false;
      enableMapInteractions();

      if (currentCoordinatesRef.current.length > 1) {
        geojsonRef.current.features.push({
          type: "Feature",
          properties: {
            color: lineColorRef.current,
            width: lineWidthRef.current,
          },
          geometry: {
            type: "LineString",
            coordinates: [...currentCoordinatesRef.current],
          },
        });
      }

      currentCoordinatesRef.current = [];
      syncSavedStrokes();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!isDrawingMode || event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      const lngLat = pointerToLngLat(event.clientX, event.clientY);
      isDrawingMapRef.current = true;
      currentCoordinatesRef.current = [[lngLat.lng, lngLat.lat]];
      disableMapInteractions();

      try {
        map.getCanvas().setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture may fail on some browsers.
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDrawingMode || !isDrawingMapRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const lngLat = pointerToLngLat(event.clientX, event.clientY);

      if (shouldAddPoint(lngLat.lng, lngLat.lat)) {
        currentCoordinatesRef.current.push([lngLat.lng, lngLat.lat]);
      }

      const liveCoords = [
        ...currentCoordinatesRef.current,
        [lngLat.lng, lngLat.lat],
      ];

      if (liveCoords.length >= 2) {
        renderFeatures(liveCoords);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!isDrawingMode || !isDrawingMapRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      try {
        map.getCanvas().releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors.
      }

      finishStroke();
    };

    const canvas = map.getCanvas();

    if (isDrawingMode) {
      canvas.style.cursor = "crosshair";
      disableMapInteractions();

      canvas.addEventListener("pointerdown", onPointerDown, true);
      canvas.addEventListener("pointermove", onPointerMove, true);
      canvas.addEventListener("pointerup", onPointerUp, true);
      canvas.addEventListener("pointercancel", onPointerUp, true);
      window.addEventListener("pointerup", onPointerUp, true);
    } else {
      canvas.style.cursor = "";
      enableMapInteractions();
    }

    return () => {
      canvas.style.cursor = "";
      canvas.removeEventListener("pointerdown", onPointerDown, true);
      canvas.removeEventListener("pointermove", onPointerMove, true);
      canvas.removeEventListener("pointerup", onPointerUp, true);
      canvas.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      enableMapInteractions();
      isDrawingMapRef.current = false;
      currentCoordinatesRef.current = [];
    };
  }, [map, isDrawingMode, renderFeatures, syncSavedStrokes]);

  return null;
};

export default FreeDrawLogic;
