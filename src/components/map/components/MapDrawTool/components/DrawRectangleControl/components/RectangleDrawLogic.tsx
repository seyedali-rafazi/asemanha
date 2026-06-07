// src/components/ExpandableToolbar/components/DrawRectangleControl/RectangleDrawLogic.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

const RectangleDrawLogic = ({ isRectMode, setIsRectMode }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const rectDataRef = useRef([]); // Stores { id, p1: [lng, lat], p2: [lng, lat] }
  const activeRectId = useRef(null);

  // Interaction states
  const interactionRef = useRef({
    mode: null, // 'drawing', 'moving', 'resizing-p1', 'resizing-p2'
    startLngLat: null,
  });

  // Convert two points into a GeoJSON Polygon feature
  const getRectPolygon = (rect) => {
    const [lng1, lat1] = rect.p1;
    const [lng2, lat2] = rect.p2;
    return {
      type: "Feature",
      properties: { id: rect.id, active: activeRectId.current === rect.id },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lng1, lat1],
            [lng2, lat1],
            [lng2, lat2],
            [lng1, lat2],
            [lng1, lat1],
          ],
        ],
      },
    };
  };

  useEffect(() => {
    if (!map) return;

    const initLayers = () => {
      if (!map.getSource("custom-rect-source")) {
        map.addSource("custom-rect-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("custom-rect-handles", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        // Rectangle Fill
        map.addLayer({
          id: "custom-rect-fill",
          type: "fill",
          source: "custom-rect-source",
          paint: {
            "fill-color": "#007cbf",
            "fill-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              0.5,
              0.3,
            ],
          },
        });

        // Rectangle Outline
        map.addLayer({
          id: "custom-rect-outline",
          type: "line",
          source: "custom-rect-source",
          paint: { "line-color": "#004b75", "line-width": 2 },
        });

        // Corner Handles (for resizing active rectangle)
        map.addLayer({
          id: "custom-rect-handles-layer",
          type: "circle",
          source: "custom-rect-handles",
          paint: {
            "circle-radius": 6,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#000000",
          },
        });
      }
    };

    if (map.isStyleLoaded()) initLayers();
    map.on("styledata", initLayers);
    return () => map.off("styledata", initLayers);
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const updateMapData = () => {
      const source = map.getSource("custom-rect-source");
      const handlesSource = map.getSource("custom-rect-handles");

      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: rectDataRef.current.map(getRectPolygon),
        });
      }

      if (handlesSource) {
        const activeRect = rectDataRef.current.find(
          (r) => r.id === activeRectId.current
        );
        const handleFeatures = activeRect
          ? [
              {
                type: "Feature",
                properties: { id: activeRect.id, handle: "p1" },
                geometry: { type: "Point", coordinates: activeRect.p1 },
              },
              {
                type: "Feature",
                properties: { id: activeRect.id, handle: "p2" },
                geometry: { type: "Point", coordinates: activeRect.p2 },
              },
            ]
          : [];

        handlesSource.setData({
          type: "FeatureCollection",
          features: handleFeatures,
        });
      }
    };

    const handlePointerDown = (e) => {
      const point = e.point;
      const lngLat = [e.lngLat.lng, e.lngLat.lat];

      // Check if clicking a handle (Resize)
      const handleFeatures = map.queryRenderedFeatures(point, {
        layers: ["custom-rect-handles-layer"],
      });
      if (handleFeatures.length > 0) {
        e.preventDefault();
        map.dragPan.disable();
        const handleType = handleFeatures[0].properties.handle;
        activeRectId.current = handleFeatures[0].properties.id;
        interactionRef.current = {
          mode: `resizing-${handleType}`,
          startLngLat: lngLat,
        };
        return;
      }

      // Check if clicking a rectangle (Move or Select)
      const rectFeatures = map.queryRenderedFeatures(point, {
        layers: ["custom-rect-fill"],
      });
      if (rectFeatures.length > 0 && !isRectMode) {
        e.preventDefault();
        map.dragPan.disable();
        activeRectId.current = rectFeatures[0].properties.id;
        interactionRef.current = { mode: "moving", startLngLat: lngLat };
        updateMapData();
        return;
      }

      // Start Drawing new rectangle
      if (isRectMode) {
        e.preventDefault();
        map.dragPan.disable();
        const newId = Date.now().toString();
        rectDataRef.current.push({ id: newId, p1: lngLat, p2: lngLat });
        activeRectId.current = newId;
        interactionRef.current = { mode: "drawing", startLngLat: lngLat };
      } else {
        // Deselect
        activeRectId.current = null;
        updateMapData();
      }
    };

    const handlePointerMove = (e) => {
      const { mode, startLngLat } = interactionRef.current;
      if (!mode) return;

      e.preventDefault();
      const currentLngLat = [e.lngLat.lng, e.lngLat.lat];
      const activeRect = rectDataRef.current.find(
        (r) => r.id === activeRectId.current
      );

      if (!activeRect) return;

      if (mode === "drawing") {
        activeRect.p2 = currentLngLat;
      } else if (mode === "resizing-p1") {
        activeRect.p1 = currentLngLat;
      } else if (mode === "resizing-p2") {
        activeRect.p2 = currentLngLat;
      } else if (mode === "moving") {
        // Calculate math delta $lng$ and $lat$
        const dLng = currentLngLat[0] - startLngLat[0];
        const dLat = currentLngLat[1] - startLngLat[1];

        activeRect.p1 = [activeRect.p1[0] + dLng, activeRect.p1[1] + dLat];
        activeRect.p2 = [activeRect.p2[0] + dLng, activeRect.p2[1] + dLat];

        // Update startLngLat for the next move frame
        interactionRef.current.startLngLat = currentLngLat;
      }

      updateMapData();
    };

    const handlePointerUp = () => {
      if (interactionRef.current.mode === "drawing") {
        setIsRectMode(false); // Turn off draw mode after one is created
      }
      interactionRef.current = { mode: null, startLngLat: null };
      map.dragPan.enable();
    };

    map.on("mousedown", handlePointerDown);
    map.on("mousemove", handlePointerMove);
    map.on("mouseup", handlePointerUp);

    // Touch support for mobile
    map.on("touchstart", handlePointerDown);
    map.on("touchmove", handlePointerMove);
    map.on("touchend", handlePointerUp);

    // Cursor styles
    if (isRectMode) map.getCanvas().style.cursor = "crosshair";
    else map.getCanvas().style.cursor = "";

    return () => {
      map.off("mousedown", handlePointerDown);
      map.off("mousemove", handlePointerMove);
      map.off("mouseup", handlePointerUp);
      map.off("touchstart", handlePointerDown);
      map.off("touchmove", handlePointerMove);
      map.off("touchend", handlePointerUp);
    };
  }, [map, isRectMode, setIsRectMode]);

  return null;
};

export default RectangleDrawLogic;
