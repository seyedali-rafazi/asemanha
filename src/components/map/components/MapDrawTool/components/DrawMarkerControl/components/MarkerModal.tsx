import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useMap } from "react-map-gl/mapbox";
import type { MarkerButtonProps } from "../types/MarkerType";
import generateMarkerSvg from "../utils/generateMarkerSvg";

const initialMarkerState = {
  id: null,
  name: "",
  lat: 35,
  lon: 53,
  markerColor: "#ff0000",
  iconType: "star",
  iconColor: "#ffffff",
  size: 40,
  opacity: 100,
};

const MarkerModal: FC<MarkerButtonProps> = ({
  isDrawing,
  setIsDrawing,
  activeTool,
  setActiveTool,
}) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const [open, setOpen] = useState(false);
  const [markerData, setMarkerData] = useState(initialMarkerState);

  const markersRef = useRef([]);
  const isDrawingRef = useRef(isDrawing);

  useEffect(() => {
    if (activeTool && activeTool !== "marker") {
      setIsDrawing(false);
    }
  }, [activeTool, setIsDrawing]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
    if (map && map.getCanvas()) {
      map.getCanvas().style.cursor = isDrawing ? "crosshair" : "";
    }
  }, [isDrawing, map]);

  const initMapLayers = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;

    const currentFeatures = markersRef.current.map((m) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [m.lon, m.lat] },
      properties: { id: m.id, name: m.name, imageId: `marker-img-${m.id}` },
    }));

    if (!map.getSource("custom-markers-source")) {
      map.addSource("custom-markers-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: currentFeatures },
      });
    }

    if (!map.getLayer("custom-markers-layer")) {
      map.addLayer({
        id: "custom-markers-layer",
        type: "symbol",
        source: "custom-markers-source",
        layout: {
          "icon-image": ["get", "imageId"],
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
          "text-field": ["get", "name"],
          "text-offset": [0, 0.5],
          "text-anchor": "top",
          "text-size": 14,
        },
        paint: {
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-color": "#333333",
        },
      });
    }
  }, [map]);

  const restoreMarkerImages = useCallback(() => {
    if (!map || markersRef.current.length === 0) return;

    markersRef.current.forEach((marker) => {
      const svgString = generateMarkerSvg(marker);
      const svgDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        svgString
      )}`;
      const img = new Image(marker.size, marker.size);
      img.onload = () => {
        const imageId = `marker-img-${marker.id}`;
        if (map.hasImage(imageId)) map.removeImage(imageId);
        map.addImage(imageId, img);
      };
      img.src = svgDataUrl;
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const onStyleLoad = () => {
      initMapLayers();
      restoreMarkerImages();
    };

    if (map.isStyleLoaded()) {
      initMapLayers();
    }

    map.on("style.load", onStyleLoad);

    const handleMapClick = (e) => {
      if (map.getLayer("custom-markers-layer")) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["custom-markers-layer"],
        });
        if (features.length > 0) {
          e.preventDefault();
          const clickedId = features[0].properties.id;
          const marker = markersRef.current.find((m) => m.id === clickedId);
          if (marker) {
            setMarkerData(marker);
            setOpen(true);
          }
          return;
        }
      }

      if (isDrawingRef.current) {
        setMarkerData({
          ...initialMarkerState,
          id: Date.now().toString(),
          lat: parseFloat(e.lngLat.lat.toFixed(5)),
          lon: parseFloat(e.lngLat.lng.toFixed(5)),
        });
        setOpen(true);
        setIsDrawing(false);
      }
    };

    const handleMouseEnter = () => {
      if (!isDrawingRef.current && map.getCanvas()) {
        map.getCanvas().style.cursor = "pointer";
      }
    };

    const handleMouseLeave = () => {
      if (!isDrawingRef.current && map.getCanvas()) {
        map.getCanvas().style.cursor = "";
      }
    };

    map.on("click", handleMapClick);
    map.on("mouseenter", "custom-markers-layer", handleMouseEnter);
    map.on("mouseleave", "custom-markers-layer", handleMouseLeave);

    return () => {
      map.off("style.load", onStyleLoad);
      map.off("click", handleMapClick);
      map.off("mouseenter", "custom-markers-layer", handleMouseEnter);
      map.off("mouseleave", "custom-markers-layer", handleMouseLeave);
    };
  }, [map, initMapLayers, restoreMarkerImages]);

  const updateGeojsonSource = (currentMarkers) => {
    if (!map) return;
    initMapLayers();

    const source = map.getSource("custom-markers-source");
    if (!source) return;

    const geojsonData = {
      type: "FeatureCollection",
      features: currentMarkers.map((m) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [m.lon, m.lat] },
        properties: { id: m.id, name: m.name, imageId: `marker-img-${m.id}` },
      })),
    };

    (source as any).setData(geojsonData);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field) => (event) => {
    const raw = event?.target?.value ?? event;
    let value = raw;
    if (["lat", "lon", "size", "opacity"].includes(field)) {
      value = Number(raw);
    }
    setMarkerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!map) return;
    initMapLayers();

    const svgString = generateMarkerSvg(markerData);
    const svgDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      svgString
    )}`;

    const img = new Image(markerData.size, markerData.size);
    img.onload = () => {
      const imageId = `marker-img-${markerData.id}`;

      if (map.hasImage(imageId)) map.removeImage(imageId);
      map.addImage(imageId, img);

      let updatedMarkers;
      const existingIndex = markersRef.current.findIndex(
        (m) => m.id === markerData.id
      );

      if (existingIndex >= 0) {
        updatedMarkers = [...markersRef.current];
        updatedMarkers[existingIndex] = markerData;
      } else {
        updatedMarkers = [...markersRef.current, markerData];
      }

      markersRef.current = updatedMarkers;
      updateGeojsonSource(updatedMarkers);
      handleClose();
    };

    img.onerror = (err) => console.error("Failed to load SVG Image:", err);
    img.src = svgDataUrl;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {markersRef.current.some((m) => m.id === markerData.id)
          ? "Edit Marker"
          : "Create Custom Marker"}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Marker Name"
          value={markerData.name}
          onChange={handleChange("name")}
          fullWidth
          size="small"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Latitude"
            type="number"
            value={markerData.lat}
            onChange={handleChange("lat")}
            fullWidth
            size="small"
          />
          <TextField
            label="Longitude"
            type="number"
            value={markerData.lon}
            onChange={handleChange("lon")}
            fullWidth
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Marker Color"
            type="color"
            value={markerData.markerColor}
            onChange={handleChange("markerColor")}
            fullWidth
            size="small"
          />
          <TextField
            label="Icon Color"
            type="color"
            value={markerData.iconColor}
            onChange={handleChange("iconColor")}
            fullWidth
            size="small"
          />
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Icon Shape</InputLabel>
          <Select
            value={markerData.iconType}
            label="Icon Shape"
            onChange={handleChange("iconType")}
          >
            <MenuItem value="star">Star</MenuItem>
            <MenuItem value="circle">Circle</MenuItem>
            <MenuItem value="square">Square</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" color="textSecondary">
            Marker Size: {markerData.size}px
          </Typography>
          <Slider
            value={markerData.size}
            onChange={handleChange("size")}
            min={20}
            max={120}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography variant="caption" color="textSecondary">
            Transparency: {markerData.opacity}%
          </Typography>
          <Slider
            value={markerData.opacity}
            onChange={handleChange("opacity")}
            min={10}
            max={100}
            valueLabelDisplay="auto"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkerModal;
