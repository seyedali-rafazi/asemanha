import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

const FreeDrawLogic = ({
  isDrawingMode,
  lineColor,
  lineWidth,
  activeTool,
  setIsDrawingMode,
}) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const isDrawingMapRef = useRef(false);
  const currentCoordinatesRef = useRef([]);
  const geojsonRef = useRef({
    type: "FeatureCollection",
    features: [],
  });

  useEffect(() => {
    if (!map) return;

    // Initialize Map Sources and Layers
    const initLayers = () => {
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
    };

    if (map.isStyleLoaded()) initLayers();
    map.on("styledata", initLayers);

    return () => {
      map.off("styledata", initLayers);
    };
  }, [map]);

  // Handle free draw events (Mouse + Touch)
  useEffect(() => {
    if (!map) return;

    if (!activeTool) {
      setIsDrawingMode(false);
    }

    const updateSource = () => {
      const source = map.getSource("custom-freedraw-source");
      if (source) source.setData(geojsonRef.current);
    };

    const onDrawStart = (e) => {
      if (!isDrawingMode && !activeTool) return;
      e.preventDefault(); // Prevents map panning/scrolling

      isDrawingMapRef.current = true;

      // e.lngLat handles both mouse and single-touch events in Mapbox
      currentCoordinatesRef.current = [[e.lngLat.lng, e.lngLat.lat]];

      // Disable map panning while drawing
      map.dragPan.disable();
    };

    const onDrawMove = (e) => {
      if ((!isDrawingMode && activeTool) || !isDrawingMapRef.current) return;
      e.preventDefault();

      currentCoordinatesRef.current.push([e.lngLat.lng, e.lngLat.lat]);

      // Create a temporary feature collection including the current line being drawn
      const currentFeature = {
        type: "Feature",
        properties: {
          color: lineColor,
          width: lineWidth,
        },
        geometry: {
          type: "LineString",
          coordinates: currentCoordinatesRef.current,
        },
      };

      const tempData = {
        type: "FeatureCollection",
        features: [...geojsonRef.current.features, currentFeature],
      };

      const source = map.getSource("custom-freedraw-source");
      if (source) source.setData(tempData);
    };

    const onDrawEnd = () => {
      if (
        (!isDrawingMode && activeTool && activeTool) ||
        !isDrawingMapRef.current
      )
        return;
      isDrawingMapRef.current = false;
      map.dragPan.enable();

      if (currentCoordinatesRef.current.length > 1) {
        // Save the finished line to our persistent geojson reference
        geojsonRef.current.features.push({
          type: "Feature",
          properties: {
            color: lineColor,
            width: lineWidth,
          },
          geometry: {
            type: "LineString",
            coordinates: currentCoordinatesRef.current,
          },
        });
        updateSource();
      }

      currentCoordinatesRef.current = [];
    };

    if (isDrawingMode && activeTool) {
      map.getCanvas().style.cursor = "crosshair";

      // Mouse Events
      map.on("mousedown", onDrawStart);
      map.on("mousemove", onDrawMove);
      map.on("mouseup", onDrawEnd);

      // Touch Events for mobile screens
      map.on("touchstart", onDrawStart);
      map.on("touchmove", onDrawMove);
      map.on("touchend", onDrawEnd);
      map.on("touchcancel", onDrawEnd);
    } else {
      map.getCanvas().style.cursor = "";
      map.dragPan.enable(); // Ensure drag is re-enabled if mode is toggled off mid-draw
    }

    return () => {
      // Cleanup Mouse Events
      map.off("mousedown", onDrawStart);
      map.off("mousemove", onDrawMove);
      map.off("mouseup", onDrawEnd);

      // Cleanup Touch Events
      map.off("touchstart", onDrawStart);
      map.off("touchmove", onDrawMove);
      map.off("touchend", onDrawEnd);
      map.off("touchcancel", onDrawEnd);
    };
  }, [map, isDrawingMode, lineColor, lineWidth, activeTool]);

  return null;
};

export default FreeDrawLogic;
