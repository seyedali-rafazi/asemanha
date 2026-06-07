import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useMap } from "react-map-gl/mapbox";
import CheckIcon from "@mui/icons-material/Check"; // Assuming you have mui icons
import { createPortal } from "react-dom";
import useIsTouchDevice from "../../../../../../../hooks/useIsTouchDevice";

interface LineModalProps {
  isDrawingLine: boolean;
  setIsDrawingLine: (val: boolean) => void;
}

const initialLineState = {
  id: "",
  name: "",
  lineColor: "#2196f3",
  lineWidth: 4,
  opacity: 100,
  coordinates: [] as number[][],
};

const LineModal: FC<LineModalProps> = ({ isDrawingLine, setIsDrawingLine }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();
  const isTouchDevice = useIsTouchDevice();

  const [open, setOpen] = useState(false);
  const [lineData, setLineData] = useState(initialLineState);

  // NEW STATE: Track if we have enough points to show the "Finish" button
  const [hasEnoughPoints, setHasEnoughPoints] = useState(false);

  const currentLineCoordsRef = useRef<number[][]>([]);
  const linesRef = useRef<any[]>([]);
  const isDrawingLineRef = useRef(isDrawingLine);

  const initMapLayers = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;

    const completedFeatures = linesRef.current.map((line) => ({
      type: "Feature",
      geometry: { type: "LineString", coordinates: line.coordinates },
      properties: {
        id: line.id,
        name: line.name,
        color: line.lineColor,
        width: line.lineWidth,
        opacity: line.opacity / 100,
      },
    }));

    if (!map.getSource("custom-lines-source")) {
      map.addSource("custom-lines-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: completedFeatures as any },
      });
    }

    if (!map.getLayer("custom-lines-layer")) {
      map.addLayer({
        id: "custom-lines-layer",
        type: "line",
        source: "custom-lines-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": ["get", "opacity"],
        },
      });
    }

    if (!map.getSource("draft-line-source")) {
      map.addSource("draft-line-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer("draft-line-layer")) {
      map.addLayer({
        id: "draft-line-layer",
        type: "line",
        source: "draft-line-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff9800",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });
    }
  }, [map]);

  const updateDraftLineSource = useCallback(
    (liveCoords?: number[][]) => {
      if (!map) return;
      initMapLayers();

      const source = map.getSource("draft-line-source") as any;
      if (!source) return;

      const coordsToDraw = liveCoords || currentLineCoordsRef.current;

      if (coordsToDraw.length > 1) {
        source.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: coordsToDraw },
            },
          ],
        });
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    },
    [map, initMapLayers]
  );

  const updateCompletedLinesSource = useCallback(() => {
    if (!map) return;
    initMapLayers();

    const source = map.getSource("custom-lines-source") as any;
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: linesRef.current.map((line) => ({
        type: "Feature",
        geometry: { type: "LineString", coordinates: line.coordinates },
        properties: {
          id: line.id,
          name: line.name,
          color: line.lineColor,
          width: line.lineWidth,
          opacity: line.opacity / 100,
        },
      })),
    });
  }, [map, initMapLayers]);

  // NEW: Extracted finish drawing logic so both PC (dblclick) and Mobile (button) can use it
  const handleFinishDrawing = useCallback(() => {
    if (currentLineCoordsRef.current.length >= 2) {
      setLineData({
        ...initialLineState,
        id: Date.now().toString(),
        coordinates: [...currentLineCoordsRef.current],
      });
      setOpen(true);
      setIsDrawingLine(false);
      currentLineCoordsRef.current = [];
      updateDraftLineSource();
      setHasEnoughPoints(false);
    } else {
      currentLineCoordsRef.current = [];
      updateDraftLineSource();
      setIsDrawingLine(false);
      setHasEnoughPoints(false);
    }
  }, [setIsDrawingLine, updateDraftLineSource]);

  useEffect(() => {
    isDrawingLineRef.current = isDrawingLine;
    if (map && map.getCanvas()) {
      map.getCanvas().style.cursor = isDrawingLine ? "crosshair" : "";
    }

    // Clear temporary coords if we manually toggle off the drawing button
    if (!isDrawingLine) {
      currentLineCoordsRef.current = [];
      updateDraftLineSource();
      setHasEnoughPoints(false);
    }
  }, [isDrawingLine, map, updateDraftLineSource]);

  useEffect(() => {
    if (!map) return;

    if (map.isStyleLoaded()) {
      initMapLayers();
    }

    map.on("styledata", initMapLayers);

    const handleMapClick = (e: any) => {
      if (!isDrawingLineRef.current && map.getLayer("custom-lines-layer")) {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["custom-lines-layer"],
        });
        if (features.length > 0) {
          e.preventDefault();
          const clickedId = features[0].properties?.id;
          const line = linesRef.current.find((l) => l.id === clickedId);
          if (line) {
            setLineData(line);
            setOpen(true);
          }
          return;
        }
      }

      if (isDrawingLineRef.current) {
        currentLineCoordsRef.current = [
          ...currentLineCoordsRef.current,
          [e.lngLat.lng, e.lngLat.lat],
        ];

        // Show the Finish button on screen if we have 2 or more points
        if (currentLineCoordsRef.current.length >= 2) {
          setHasEnoughPoints(true);
        }

        updateDraftLineSource();
      }
    };

    const handleMapMouseMove = (e: any) => {
      if (isDrawingLineRef.current && currentLineCoordsRef.current.length > 0) {
        const liveCoords = [
          ...currentLineCoordsRef.current,
          [e.lngLat.lng, e.lngLat.lat],
        ];
        updateDraftLineSource(liveCoords);
      }
    };

    const handleMapDblClick = (e: any) => {
      if (isDrawingLineRef.current) {
        e.preventDefault();
        handleFinishDrawing(); // <-- Now uses the shared function
      }
    };

    const handleMouseEnter = () => {
      if (!isDrawingLineRef.current && map.getCanvas()) {
        map.getCanvas().style.cursor = "pointer";
      }
    };

    const handleMouseLeave = () => {
      if (!isDrawingLineRef.current && map.getCanvas()) {
        map.getCanvas().style.cursor = "";
      }
    };

    map.on("click", handleMapClick);
    map.on("mousemove", handleMapMouseMove);
    map.on("dblclick", handleMapDblClick);
    map.on("mouseenter", "custom-lines-layer", handleMouseEnter);
    map.on("mouseleave", "custom-lines-layer", handleMouseLeave);

    return () => {
      map.off("styledata", initMapLayers);
      map.off("click", handleMapClick);
      map.off("mousemove", handleMapMouseMove);
      map.off("dblclick", handleMapDblClick);
      map.off("mouseenter", "custom-lines-layer", handleMouseEnter);
      map.off("mouseleave", "custom-lines-layer", handleMouseLeave);
    };
  }, [map, initMapLayers, updateDraftLineSource, handleFinishDrawing]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (field: string) => (event: any) => {
    let value = event.target.value;
    if (["lineWidth", "opacity"].includes(field)) {
      value = Number(value);
    }
    setLineData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!map) return;
    initMapLayers();

    const existingIndex = linesRef.current.findIndex(
      (l) => l.id === lineData.id
    );

    if (existingIndex >= 0) {
      linesRef.current[existingIndex] = lineData;
    } else {
      linesRef.current = [...linesRef.current, lineData];
    }

    updateCompletedLinesSource();
    handleClose();
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON FOR MOBILE DEVICES */}
      {isDrawingLine &&
        hasEnoughPoints &&
        isTouchDevice &&
        createPortal(
          <Box
            sx={{
              position: "fixed", // Changed from "absolute" to "fixed"
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckIcon />}
              onClick={handleFinishDrawing}
              sx={{ borderRadius: 4, boxShadow: 3, px: 2, py: 0.5 }}
            >
              Finish
            </Button>
          </Box>,
          document.body // 👈 Renders directly into body, outside all parents
        )}

      {/* CONFIGURATION DIALOG */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {linesRef.current.some((l) => l.id === lineData.id)
            ? "Edit Line"
            : "Create Custom Line"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}
        >
          <TextField
            label="Line Name"
            value={lineData.name}
            onChange={handleChange("name")}
            fullWidth
            size="small"
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Line Color"
              type="color"
              value={lineData.lineColor}
              onChange={handleChange("lineColor")}
              fullWidth
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Line Width: {lineData.lineWidth}px
            </Typography>
            <Slider
              value={lineData.lineWidth}
              onChange={handleChange("lineWidth")}
              min={1}
              max={20}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography variant="caption" color="textSecondary">
              Transparency: {lineData.opacity}%
            </Typography>
            <Slider
              value={lineData.opacity}
              onChange={handleChange("opacity")}
              min={10}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          <Typography variant="caption" color="textSecondary">
            Vertices: {lineData.coordinates.length}
          </Typography>
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
    </>
  );
};

export default LineModal;
