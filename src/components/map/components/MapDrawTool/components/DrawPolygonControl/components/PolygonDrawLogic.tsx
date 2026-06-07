// src/components/ExpandableToolbar/components/DrawPolygonControl/PolygonDrawLogic.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

const PolygonDrawLogic = ({ isPolyMode, setIsPolyMode }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const polyDataRef = useRef([]); // Stores { id, vertices: [[lng, lat], ...] }
  const activePolyId = useRef(null);
  const hoverLngLat = useRef(null); // Used for the preview line
  const isDrawingRef = useRef(false); // Cleanly track if we are mid-drawing
  const lastTapTimeRef = useRef(0); // Used to detect double-taps on mobile

  const interactionRef = useRef({
    mode: null, // 'moving', 'editing-vertex'
    vertexIndex: null,
    startLngLat: null,
  });

  const getPolyGeoJSON = (poly) => {
    const coords = [...poly.vertices];
    const isCurrentlyDrawing =
      isDrawingRef.current && poly.id === activePolyId.current;

    // Add the preview line to the current mouse position
    if (isCurrentlyDrawing && hoverLngLat.current) {
      coords.push(hoverLngLat.current);
    }

    // A valid Mapbox Polygon must have the first and last point be the same
    // Only close it if we are done drawing it and it has enough points
    if (!isCurrentlyDrawing && coords.length > 2) {
      coords.push(coords[0]);
    }

    return {
      type: "Feature",
      properties: { id: poly.id, active: activePolyId.current === poly.id },
      geometry: {
        type: coords.length > 2 ? "Polygon" : "LineString",
        coordinates: coords.length > 2 ? [coords] : coords,
      },
    };
  };

  useEffect(() => {
    if (!map) return;

    const initLayers = () => {
      if (!map.getSource("custom-poly-source")) {
        map.addSource("custom-poly-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("custom-poly-handles", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "custom-poly-fill",
          type: "fill",
          source: "custom-poly-source",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "fill-color": "#e67e22",
            "fill-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              0.6,
              0.3,
            ],
          },
        });

        map.addLayer({
          id: "custom-poly-outline",
          type: "line",
          source: "custom-poly-source",
          paint: { "line-color": "#d35400", "line-width": 2 },
        });

        map.addLayer({
          id: "custom-poly-handles-layer",
          type: "circle",
          source: "custom-poly-handles",
          paint: {
            "circle-radius": 8, // Increased radius slightly for better touch targets
            "circle-color": "#fff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#d35400",
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
      const source = map.getSource("custom-poly-source");
      const handlesSource = map.getSource("custom-poly-handles");

      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: polyDataRef.current
            .filter((p) => p.vertices.length > 0)
            .map(getPolyGeoJSON),
        });
      }

      if (handlesSource) {
        const activePoly = polyDataRef.current.find(
          (p) => p.id === activePolyId.current
        );
        // Only show handles if we are NOT currently drawing
        const handleFeatures =
          activePoly && !isDrawingRef.current
            ? activePoly.vertices.map((v, i) => ({
                type: "Feature",
                properties: { id: activePoly.id, index: i },
                geometry: { type: "Point", coordinates: v },
              }))
            : [];

        handlesSource.setData({
          type: "FeatureCollection",
          features: handleFeatures,
        });
      }
    };

    const finishDrawing = () => {
      if (!isDrawingRef.current) return;

      const activePoly = polyDataRef.current.find(
        (p) => p.id === activePolyId.current
      );
      if (activePoly) {
        // Remove duplicate points caused by fast double-clicking/tapping
        const cleanedVertices = [];
        for (let i = 0; i < activePoly.vertices.length; i++) {
          const pt = activePoly.vertices[i];
          const prevPt = cleanedVertices[cleanedVertices.length - 1];

          // Only keep the point if it has a different $lng$ or $lat$ than the previous one
          if (!prevPt || pt[0] !== prevPt[0] || pt[1] !== prevPt[1]) {
            cleanedVertices.push(pt);
          }
        }
        activePoly.vertices = cleanedVertices;
      }

      isDrawingRef.current = false;
      hoverLngLat.current = null;
      setIsPolyMode(false); // Turn off the toolbar button
      updateMapData();
    };

    // Keyboard listener for Enter key
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isDrawingRef.current) {
        finishDrawing();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handlePointerDown = (e) => {
      // Safety check for touch events that might not have lngLat
      if (!e.lngLat || !e.point) return;

      const point = e.point;
      const lngLat = [e.lngLat.lng, e.lngLat.lat];

      // Custom Double-Tap / Double-Click Detection
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTimeRef.current;
      if (tapLength < 300 && tapLength > 0) {
        if (isDrawingRef.current) {
          e.preventDefault();
          finishDrawing();
          return;
        }
      }
      lastTapTimeRef.current = currentTime;

      // 1. Drawing logic
      if (isPolyMode) {
        e.preventDefault();

        // Start a completely new polygon
        if (!isDrawingRef.current) {
          const newId = Date.now().toString();
          polyDataRef.current.push({ id: newId, vertices: [lngLat] });
          activePolyId.current = newId;
          isDrawingRef.current = true;
        } else {
          // Add point to current drawing polygon
          const activePoly = polyDataRef.current.find(
            (p) => p.id === activePolyId.current
          );

          // Check if clicking near the first point to close it
          const firstPt = map.project(activePoly.vertices[0]);
          const distance = Math.sqrt(
            Math.pow(point.x - firstPt.x, 2) + Math.pow(point.y - firstPt.y, 2)
          );

          if (distance < 20 && activePoly.vertices.length > 2) {
            // Increased tolerance for fat fingers
            finishDrawing();
          } else {
            activePoly.vertices.push(lngLat);
          }
        }
        updateMapData();
        return;
      }

      // 2. Check if clicking a vertex handle (Edit shape)
      const handleFeatures = map.queryRenderedFeatures(point, {
        layers: ["custom-poly-handles-layer"],
      });
      if (handleFeatures.length > 0) {
        e.preventDefault();
        map.dragPan.disable();
        activePolyId.current = handleFeatures[0].properties.id;
        interactionRef.current = {
          mode: "editing-vertex",
          vertexIndex: handleFeatures[0].properties.index,
          startLngLat: lngLat,
        };
        return;
      }

      // 3. Check if clicking inside a polygon (Move shape)
      const polyFeatures = map.queryRenderedFeatures(point, {
        layers: ["custom-poly-fill"],
      });
      if (polyFeatures.length > 0) {
        e.preventDefault();
        map.dragPan.disable();
        activePolyId.current = polyFeatures[0].properties.id;
        interactionRef.current = { mode: "moving", startLngLat: lngLat };
        updateMapData();
        return;
      }

      // Deselect if clicking on empty map
      activePolyId.current = null;
      updateMapData();
    };

    const handlePointerMove = (e) => {
      if (!e.lngLat) return;
      const currentLngLat = [e.lngLat.lng, e.lngLat.lat];

      // Handle preview line update while drawing
      if (isDrawingRef.current) {
        hoverLngLat.current = currentLngLat;
        updateMapData();
        return;
      }

      const { mode, vertexIndex, startLngLat } = interactionRef.current;
      if (!mode) return;

      e.preventDefault();
      const activePoly = polyDataRef.current.find(
        (p) => p.id === activePolyId.current
      );
      if (!activePoly) return;

      if (mode === "editing-vertex" && vertexIndex !== null) {
        activePoly.vertices[vertexIndex] = currentLngLat;
      } else if (mode === "moving" && startLngLat) {
        // Math for moving: shift everything by $ \Delta lng $ and $ \Delta lat $
        const dLng = currentLngLat[0] - startLngLat[0];
        const dLat = currentLngLat[1] - startLngLat[1];

        activePoly.vertices = activePoly.vertices.map((v) => [
          v[0] + dLng,
          v[1] + dLat,
        ]);
        interactionRef.current.startLngLat = currentLngLat;
      }

      updateMapData();
    };

    const handlePointerUp = () => {
      interactionRef.current = {
        mode: null,
        vertexIndex: null,
        startLngLat: null,
      };
      map.dragPan.enable();
    };

    // Prevent default map zooming on double click when in drawing mode
    if (isPolyMode) {
      map.doubleClickZoom.disable();
      map.getCanvas().style.cursor = "crosshair";
    } else {
      map.doubleClickZoom.enable();
      map.getCanvas().style.cursor = "";
    }

    // Mouse Events
    map.on("mousedown", handlePointerDown);
    map.on("mousemove", handlePointerMove);
    map.on("mouseup", handlePointerUp);

    // Touch Events
    map.on("touchstart", handlePointerDown);
    map.on("touchmove", handlePointerMove);
    map.on("touchend", handlePointerUp);
    map.on("touchcancel", handlePointerUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      map.off("mousedown", handlePointerDown);
      map.off("mousemove", handlePointerMove);
      map.off("mouseup", handlePointerUp);

      map.off("touchstart", handlePointerDown);
      map.off("touchmove", handlePointerMove);
      map.off("touchend", handlePointerUp);
      map.off("touchcancel", handlePointerUp);

      map.doubleClickZoom.enable(); // Ensure zoom works when unmounting
    };
  }, [map, isPolyMode, setIsPolyMode]);

  return null;
};

export default PolygonDrawLogic;
