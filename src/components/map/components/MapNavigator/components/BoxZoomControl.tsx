import { Box, Tooltip, IconButton, useTheme } from "@mui/material";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import { useState, useEffect, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";

const BoxZoomControl = () => {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(false);
  const { current: map } = useMap();
  const mapRef = useRef(null);

  useEffect(() => {
    if (map) {
      mapRef.current = map;
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isActive) return;

    // 1. Forcefully disable panning and touch interactions
    if (map.dragPan) map.dragPan.disable();
    if (map.touchZoomRotate) map.touchZoomRotate.disable();
    if (map.touchPitch) map.touchPitch.disable();
    map.getCanvas().style.cursor = "crosshair";

    let isDragging = false;
    let startPoint = null;
    let boxElement = null;

    const onDragStart = (e) => {
      // Check if it's a mouse event (ensure left click) or touch event (ensure single finger)
      if (e.type === "mousedown" && e.originalEvent.button !== 0) return;
      if (e.type === "touchstart" && e.originalEvent.touches.length > 1) return;

      // Prevent default map behavior
      e.preventDefault();
      e.originalEvent.stopPropagation();

      isDragging = true;
      startPoint = e.point;

      // Create the visual rectangle
      boxElement = document.createElement("div");
      Object.assign(boxElement.style, {
        position: "absolute",
        border: "2px solid #1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.3)",
        zIndex: "9999",
        pointerEvents: "none", // Let mouse/touch events pass through to the map
      });

      map.getCanvasContainer().appendChild(boxElement);
    };

    const onDragMove = (e) => {
      if (!isDragging || !boxElement) return;

      e.preventDefault();
      e.originalEvent.stopPropagation();

      const currentPoint = e.point;
      const minX = Math.min(startPoint.x, currentPoint.x);
      const maxX = Math.max(startPoint.x, currentPoint.x);
      const minY = Math.min(startPoint.y, currentPoint.y);
      const maxY = Math.max(startPoint.y, currentPoint.y);

      boxElement.style.left = `${minX}px`;
      boxElement.style.top = `${minY}px`;
      boxElement.style.width = `${maxX - minX}px`;
      boxElement.style.height = `${maxY - minY}px`;
    };

    const onDragEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;

      // Remove the HTML rectangle
      if (boxElement && boxElement.parentNode) {
        boxElement.parentNode.removeChild(boxElement);
        boxElement = null;
      }

      // 'touchend' might not have e.point directly, fallback to the last known position if needed
      // Mapbox usually populates e.point for touchend but let's be safe.
      const currentPoint = e.point || startPoint;

      const dist = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
      );

      // Zoom if they actually dragged a box (not just a tap)
      if (dist > 5) {
        const p1 = map.unproject(startPoint);
        const p2 = map.unproject(currentPoint);

        const bounds = [
          [Math.min(p1.lng, p2.lng), Math.min(p1.lat, p2.lat)],
          [Math.max(p1.lng, p2.lng), Math.max(p1.lat, p2.lat)],
        ];

        map.fitBounds(bounds, { padding: 20, duration: 1000 });
      }

      // Deactivate tool after zooming
      setIsActive(false);
    };

    // Attach Mapbox event listeners for BOTH Mouse and Touch
    map.on("mousedown", onDragStart);
    map.on("mousemove", onDragMove);
    map.on("mouseup", onDragEnd);

    map.on("touchstart", onDragStart);
    map.on("touchmove", onDragMove);
    map.on("touchend", onDragEnd);

    // Cleanup when tool is deactivated or unmounted
    return () => {
      const currentMap = mapRef.current;
      if (currentMap) {
        currentMap.off("mousedown", onDragStart);
        currentMap.off("mousemove", onDragMove);
        currentMap.off("mouseup", onDragEnd);

        currentMap.off("touchstart", onDragStart);
        currentMap.off("touchmove", onDragMove);
        currentMap.off("touchend", onDragEnd);

        // Safely re-enable panning and touch behaviors
        if (currentMap.dragPan) currentMap.dragPan.enable();
        if (currentMap.touchZoomRotate) currentMap.touchZoomRotate.enable();
        if (currentMap.touchPitch) currentMap.touchPitch.enable();

        if (currentMap.getCanvas()) {
          currentMap.getCanvas().style.cursor = "";
        }
      }

      if (boxElement && boxElement.parentNode) {
        boxElement.parentNode.removeChild(boxElement);
      }
    };
  }, [isActive, map]);

  return (
    <Box>
      <Tooltip
        title={isActive ? "Cancel Zoom Box" : "Zoom Box Tool"}
        placement="left"
        arrow
      >
        <IconButton
          onClick={() => setIsActive(!isActive)}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            backgroundColor: isActive
              ? theme.palette.action.selected
              : "transparent",
            boxShadow: 1,
            color: isActive ? "primary.main" : "text.secondary",
            "&:hover": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
              borderRadius: "24px",
            },
          }}
        >
          <HighlightAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BoxZoomControl;
