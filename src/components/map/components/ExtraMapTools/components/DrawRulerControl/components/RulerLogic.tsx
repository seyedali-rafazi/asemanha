// src/components/ExpandableToolbar/components/DrawRulerControl/components/RulerLogic.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

// Haversine formula to calculate distance in km
const calculateDistance = (pt1, pt2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((pt2[1] - pt1[1]) * Math.PI) / 180;
  const dLon = ((pt2[0] - pt1[0]) * Math.PI) / 180;
  const lat1 = (pt1[1] * Math.PI) / 180;
  const lat2 = (pt2[1] * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the midpoint of a line segment for label placement
const getMidpoint = (pt1, pt2) => {
  return [(pt1[0] + pt2[0]) / 2, (pt1[1] + pt2[1]) / 2];
};

const RulerLogic = ({ isRulerMode, setIsRulerMode }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const coordinatesRef = useRef([]);
  const cursorPointRef = useRef(null);

  const updateMapData = () => {
    if (!map) return;
    const lineSource = map.getSource("ruler-line-source");
    const labelSource = map.getSource("ruler-label-source");

    const activePoints = [...coordinatesRef.current];
    if (cursorPointRef.current && isRulerMode) {
      activePoints.push(cursorPointRef.current);
    }

    if (lineSource) {
      lineSource.setData({
        type: "FeatureCollection",
        features:
          activePoints.length > 1
            ? [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: activePoints,
                  },
                },
              ]
            : [],
      });
    }

    if (labelSource) {
      const labelFeatures = [];
      let totalDistance = 0;

      for (let i = 0; i < activePoints.length - 1; i++) {
        const p1 = activePoints[i];
        const p2 = activePoints[i + 1];
        const segmentDist = calculateDistance(p1, p2);
        totalDistance += segmentDist;

        // Add segment label in the middle of the line
        labelFeatures.push({
          type: "Feature",
          properties: {
            distance: `${segmentDist.toFixed(2)} km`,
          },
          geometry: {
            type: "Point",
            coordinates: getMidpoint(p1, p2),
          },
        });
      }

      // Add total distance label directly at the cursor (or last point if finished)
      if (activePoints.length > 1) {
        const lastPoint = activePoints[activePoints.length - 1];
        labelFeatures.push({
          type: "Feature",
          properties: {
            distance: `Total: ${totalDistance.toFixed(2)} km`,
          },
          geometry: {
            type: "Point",
            coordinates: lastPoint,
          },
        });
      }

      labelSource.setData({
        type: "FeatureCollection",
        features: labelFeatures,
      });
    }
  };

  useEffect(() => {
    if (!map) return;

    const initLayers = () => {
      if (!map.getSource("ruler-line-source")) {
        map.addSource("ruler-line-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "ruler-line-layer",
          type: "line",
          source: "ruler-line-source",
          paint: {
            "line-color": "#e67e22",
            "line-width": 4,
            "line-dasharray": [2, 2],
          },
        });
      }

      if (!map.getSource("ruler-label-source")) {
        map.addSource("ruler-label-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "ruler-label-layer",
          type: "symbol",
          source: "ruler-label-source",
          layout: {
            "text-field": ["get", "distance"],
            "text-size": 14,
            "text-offset": [0, 1.5], // Pushes the text slightly below the cursor/line
            "text-allow-overlap": true, // Forces text to show even if it overlaps
            "text-ignore-placement": true, // Disables Mapbox's collision box
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#2c3e50",
            "text-halo-width": 2,
          },
        });
      }
    };

    if (map.isStyleLoaded()) initLayers();
    map.on("styledata", initLayers);
    return () => map.off("styledata", initLayers);
  }, [map]);

  // Handle clearing the map when the tool is toggled off
  useEffect(() => {
    if (!map) return;
    if (!isRulerMode) {
      coordinatesRef.current = [];
      cursorPointRef.current = null;
      map.getCanvas().style.cursor = "";
      updateMapData();
    } else {
      map.getCanvas().style.cursor = "crosshair";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRulerMode, map]);

  useEffect(() => {
    if (!map || !isRulerMode) return;

    const handleMapClick = (e) => {
      e.preventDefault();
      const lngLat = [e.lngLat.lng, e.lngLat.lat];
      coordinatesRef.current.push(lngLat);
      updateMapData();
    };

    const handlePointerMove = (e) => {
      if (coordinatesRef.current.length === 0) return;
      cursorPointRef.current = [e.lngLat.lng, e.lngLat.lat];
      updateMapData();
    };

    const handleFinish = (e) => {
      e.preventDefault();
      cursorPointRef.current = null;
      updateMapData();
    };

    map.on("click", handleMapClick);
    map.on("mousemove", handlePointerMove);
    map.on("contextmenu", handleFinish); // Right-click to finish drawing
    map.on("dblclick", handleFinish); // Double-click to finish drawing

    return () => {
      map.off("click", handleMapClick);
      map.off("mousemove", handlePointerMove);
      map.off("contextmenu", handleFinish);
      map.off("dblclick", handleFinish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isRulerMode]);

  return null;
};

export default RulerLogic;
