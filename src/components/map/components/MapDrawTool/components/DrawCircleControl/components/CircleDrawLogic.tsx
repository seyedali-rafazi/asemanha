import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

const createGeoJSONCircle = (center, radiusInKm, points = 64) => {
  const coords = [];
  const distanceX =
    radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([
      center[0] + distanceX * Math.cos(theta),
      center[1] + distanceY * Math.sin(theta),
    ]);
  }
  coords.push(coords[0]);
  return coords;
};

const getDistanceKm = (p1, p2) => {
  const R = 6371;
  const dLat = ((p2[1] - p1[1]) * Math.PI) / 180;
  const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1[1] * Math.PI) / 180) *
      Math.cos((p2[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const CircleDrawLogic = ({ isCircleMode, setIsCircleMode }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const circleDataRef = useRef([]);
  const activeCircleId = useRef(null);
  const interactionRef = useRef({ mode: null, startLngLat: null });

  const getCircleGeoJSON = (circle) => {
    return {
      type: "Feature",
      properties: {
        id: circle.id,
        active: activeCircleId.current === circle.id,
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoJSONCircle(circle.center, circle.radiusKm)],
      },
    };
  };

  useEffect(() => {
    if (!map) return;

    const initLayers = () => {
      if (!map.getSource("custom-circle-source")) {
        map.addSource("custom-circle-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addSource("custom-circle-handles", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "custom-circle-fill",
          type: "fill",
          source: "custom-circle-source",
          paint: {
            "fill-color": "#3498db",
            "fill-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              0.6,
              0.3,
            ],
          },
        });

        map.addLayer({
          id: "custom-circle-outline",
          type: "line",
          source: "custom-circle-source",
          paint: { "line-color": "#2980b9", "line-width": 2 },
        });

        map.addLayer({
          id: "custom-circle-handles-layer",
          type: "circle",
          source: "custom-circle-handles",
          paint: {
            "circle-radius": 8,
            "circle-color": "#fff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#2980b9",
          }, // Slightly larger handle for touch
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
      const source = map.getSource("custom-circle-source");
      const handlesSource = map.getSource("custom-circle-handles");

      if (source)
        source.setData({
          type: "FeatureCollection",
          features: circleDataRef.current.map(getCircleGeoJSON),
        });

      if (handlesSource) {
        const activeCircle = circleDataRef.current.find(
          (c) => c.id === activeCircleId.current
        );
        const handleFeatures =
          activeCircle && interactionRef.current.mode !== "drawing"
            ? [
                {
                  type: "Feature",
                  properties: { id: activeCircle.id, type: "edge" },
                  geometry: { type: "Point", coordinates: activeCircle.edge },
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
      if (!e.lngLat) return;
      const lngLat = [e.lngLat.lng, e.lngLat.lat];

      if (isCircleMode) {
        e.preventDefault();
        map.dragPan.disable();
        const newId = Date.now().toString();
        circleDataRef.current.push({
          id: newId,
          center: lngLat,
          edge: lngLat,
          radiusKm: 0.001,
        });
        activeCircleId.current = newId;
        interactionRef.current = { mode: "drawing" };
        updateMapData();
        return;
      }

      const handles = map.queryRenderedFeatures(e.point, {
        layers: ["custom-circle-handles-layer"],
      });
      if (handles.length > 0) {
        e.preventDefault();
        map.dragPan.disable();
        activeCircleId.current = handles[0].properties.id;
        interactionRef.current = { mode: "resizing" };
        return;
      }

      const fills = map.queryRenderedFeatures(e.point, {
        layers: ["custom-circle-fill"],
      });
      if (fills.length > 0) {
        e.preventDefault();
        map.dragPan.disable();
        activeCircleId.current = fills[0].properties.id;
        interactionRef.current = { mode: "moving", startLngLat: lngLat };
        updateMapData();
        return;
      }

      activeCircleId.current = null;
      updateMapData();
    };

    const handlePointerMove = (e) => {
      if (!e.lngLat) return;
      const lngLat = [e.lngLat.lng, e.lngLat.lat];
      const { mode, startLngLat } = interactionRef.current;
      if (!mode) return;

      const activeCircle = circleDataRef.current.find(
        (c) => c.id === activeCircleId.current
      );
      if (!activeCircle) return;

      if (mode === "drawing" || mode === "resizing") {
        activeCircle.edge = lngLat;
        activeCircle.radiusKm = getDistanceKm(
          activeCircle.center,
          activeCircle.edge
        );
      } else if (mode === "moving") {
        const $dLng$ = lngLat[0] - startLngLat[0];
        const $dLat$ = lngLat[1] - startLngLat[1];
        activeCircle.center = [
          activeCircle.center[0] + $dLng$,
          activeCircle.center[1] + $dLat$,
        ];
        activeCircle.edge = [
          activeCircle.edge[0] + $dLng$,
          activeCircle.edge[1] + $dLat$,
        ];
        interactionRef.current.startLngLat = lngLat;
      }
      updateMapData();
    };

    const handlePointerUp = () => {
      if (interactionRef.current.mode === "drawing") setIsCircleMode(false);
      interactionRef.current = { mode: null, startLngLat: null };
      map.dragPan.enable();
      updateMapData();
    };

    // Bind Mouse Events
    map.on("mousedown", handlePointerDown);
    map.on("mousemove", handlePointerMove);
    map.on("mouseup", handlePointerUp);

    // Bind Touch Events
    map.on("touchstart", handlePointerDown);
    map.on("touchmove", handlePointerMove);
    map.on("touchend", handlePointerUp);
    map.on("touchcancel", handlePointerUp);

    return () => {
      map.off("mousedown", handlePointerDown);
      map.off("mousemove", handlePointerMove);
      map.off("mouseup", handlePointerUp);

      map.off("touchstart", handlePointerDown);
      map.off("touchmove", handlePointerMove);
      map.off("touchend", handlePointerUp);
      map.off("touchcancel", handlePointerUp);
    };
  }, [map, isCircleMode, setIsCircleMode]);

  return null;
};

export default CircleDrawLogic;
