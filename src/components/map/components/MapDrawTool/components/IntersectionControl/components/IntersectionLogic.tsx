// src/components/ExpandableToolbar/components/DrawLineControl/components/LineDrawLogic.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

// Helper to check intersection of two line segments (p1-p2 and p3-p4)
const getIntersection = (p1, p2, p3, p4) => {
  const denom =
    (p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
  if (denom === 0) return null; // Parallel

  const ua =
    ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) /
    denom;
  const ub =
    ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) /
    denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return [p1[0] + ua * (p2[0] - p1[0]), p1[1] + ua * (p2[1] - p1[1])];
  }
  return null;
};

// Find all intersections among an array of lines
const calculateIntersections = (lines) => {
  const intersections = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const line1 = lines[i].coordinates;
      const line2 = lines[j].coordinates;

      // Check every segment of line1 against every segment of line2
      for (let m = 0; m < line1.length - 1; m++) {
        for (let n = 0; n < line2.length - 1; n++) {
          const pt = getIntersection(
            line1[m],
            line1[m + 1],
            line2[n],
            line2[n + 1]
          );
          if (pt) intersections.push(pt);
        }
      }
    }
  }
  return intersections;
};

const IntersectionLogic = ({ isLineMode, setIsLineMode }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const lineDataRef = useRef([]); // Array of { id, coordinates: [[lng, lat], ...] }
  const activeLineId = useRef(null);
  const interactionRef = useRef({ mode: null });

  useEffect(() => {
    if (!map) return;

    const initLayers = () => {
      // Source for lines
      if (!map.getSource("custom-line-source")) {
        map.addSource("custom-line-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "custom-line-layer",
          type: "line",
          source: "custom-line-source",
          paint: {
            "line-color": "#2c3e50",
            "line-width": 3,
          },
        });
      }

      // Source for intersection points
      if (!map.getSource("custom-intersection-source")) {
        map.addSource("custom-intersection-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "custom-intersection-layer",
          type: "circle",
          source: "custom-intersection-source",
          paint: {
            "circle-radius": 6,
            "circle-color": "red",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
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
      const lineSource = map.getSource("custom-line-source");
      const intersectionSource = map.getSource("custom-intersection-source");

      if (lineSource) {
        const features = lineDataRef.current.map((line) => ({
          type: "Feature",
          properties: { id: line.id },
          geometry: {
            type: "LineString",
            coordinates: line.coordinates,
          },
        }));
        lineSource.setData({ type: "FeatureCollection", features });
      }

      if (intersectionSource) {
        const intersectionPoints = calculateIntersections(lineDataRef.current);
        const features = intersectionPoints.map((pt, index) => ({
          type: "Feature",
          properties: { id: `int-${index}` },
          geometry: { type: "Point", coordinates: pt },
        }));
        intersectionSource.setData({ type: "FeatureCollection", features });
      }
    };

    const handlePointerDown = (e) => {
      if (!isLineMode || !e.lngLat) return;
      e.preventDefault();

      const lngLat = [e.lngLat.lng, e.lngLat.lat];

      if (interactionRef.current.mode !== "drawing") {
        // Start a new line
        map.dragPan.disable();
        const newId = Date.now().toString();
        lineDataRef.current.push({
          id: newId,
          coordinates: [lngLat, lngLat], // Start with two identical points
        });
        activeLineId.current = newId;
        interactionRef.current = { mode: "drawing" };
      } else {
        // Add point to existing line
        const activeLine = lineDataRef.current.find(
          (l) => l.id === activeLineId.current
        );
        if (activeLine) {
          activeLine.coordinates.push(lngLat);
        }
      }
      updateMapData();
    };

    const handlePointerMove = (e) => {
      if (!e.lngLat || interactionRef.current.mode !== "drawing") return;

      const activeLine = lineDataRef.current.find(
        (l) => l.id === activeLineId.current
      );
      if (!activeLine) return;

      // Update the last coordinate to follow the cursor
      const lngLat = [e.lngLat.lng, e.lngLat.lat];
      activeLine.coordinates[activeLine.coordinates.length - 1] = lngLat;

      updateMapData();
    };

    // Use double click or right click to finish drawing the line
    const handleContextMenu = (e) => {
      if (interactionRef.current.mode === "drawing") {
        e.preventDefault();
        interactionRef.current = { mode: null };
        activeLineId.current = null;
        map.dragPan.enable();
        setIsLineMode(false); // Optional: turn off drawing mode after finishing a line
      }
    };

    // Bind Events
    map.on("mousedown", handlePointerDown);
    map.on("mousemove", handlePointerMove);
    map.on("contextmenu", handleContextMenu); // Right click to finish
    map.on("dblclick", handleContextMenu); // Double click to finish

    return () => {
      map.off("mousedown", handlePointerDown);
      map.off("mousemove", handlePointerMove);
      map.off("contextmenu", handleContextMenu);
      map.off("dblclick", handleContextMenu);
    };
  }, [map, isLineMode, setIsLineMode]);

  return null;
};

export default IntersectionLogic;
