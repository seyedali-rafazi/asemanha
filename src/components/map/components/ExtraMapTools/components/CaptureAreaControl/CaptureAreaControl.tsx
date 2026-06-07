import { useState, useEffect, useRef } from "react";
import {
  Box,
  Tooltip,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import CropIcon from "@mui/icons-material/Crop";
import { useMap } from "react-map-gl/mapbox";

const CaptureAreaControl = () => {
  const theme = useTheme();
  const [isActive, setIsActive] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [fileName, setFileName] = useState("map-capture");

  const { current: map } = useMap();
  const mapRef = useRef(null);

  useEffect(() => {
    if (map) mapRef.current = map;
  }, [map]);

  useEffect(() => {
    if (!map || !isActive) return;

    if (map.dragPan) map.dragPan.disable();
    if (map.touchZoomRotate) map.touchZoomRotate.disable();
    if (map.touchPitch) map.touchPitch.disable();
    map.getCanvas().style.cursor = "crosshair";

    let isDragging = false;
    let startPoint = null;
    let boxElement = null;

    const onDragStart = (e) => {
      if (e.type === "mousedown" && e.originalEvent.button !== 0) return;
      if (e.type === "touchstart" && e.originalEvent.touches.length > 1) return;

      e.preventDefault();
      e.originalEvent.stopPropagation();

      isDragging = true;
      startPoint = e.point;

      boxElement = document.createElement("div");
      Object.assign(boxElement.style, {
        position: "absolute",
        border: "2px dashed #f50057",
        backgroundColor: "rgba(245, 0, 87, 0.2)",
        zIndex: "9999",
        pointerEvents: "none",
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

      let rectData = null;

      if (boxElement && boxElement.parentNode) {
        // Get dimensions before removing
        const currentPoint = e.point || startPoint;
        const minX = Math.min(startPoint.x, currentPoint.x);
        const maxX = Math.max(startPoint.x, currentPoint.x);
        const minY = Math.min(startPoint.y, currentPoint.y);
        const maxY = Math.max(startPoint.y, currentPoint.y);

        const width = maxX - minX;
        const height = maxY - minY;

        if (width > 10 && height > 10) {
          rectData = { minX, minY, width, height };
        }

        boxElement.parentNode.removeChild(boxElement);
        boxElement = null;
      }

      setIsActive(false);

      if (rectData) {
        processCapture(rectData);
      }
    };

    map.on("mousedown", onDragStart);
    map.on("mousemove", onDragMove);
    map.on("mouseup", onDragEnd);
    map.on("touchstart", onDragStart);
    map.on("touchmove", onDragMove);
    map.on("touchend", onDragEnd);

    return () => {
      const currentMap = mapRef.current;
      if (currentMap) {
        currentMap.off("mousedown", onDragStart);
        currentMap.off("mousemove", onDragMove);
        currentMap.off("mouseup", onDragEnd);
        currentMap.off("touchstart", onDragStart);
        currentMap.off("touchmove", onDragMove);
        currentMap.off("touchend", onDragEnd);

        if (currentMap.dragPan) currentMap.dragPan.enable();
        if (currentMap.touchZoomRotate) currentMap.touchZoomRotate.enable();
        if (currentMap.touchPitch) currentMap.touchPitch.enable();
        if (currentMap.getCanvas()) currentMap.getCanvas().style.cursor = "";
      }
      if (boxElement && boxElement.parentNode)
        boxElement.parentNode.removeChild(boxElement);
    };
  }, [isActive, map]);

  // Handle the image cropping
  const processCapture = ({ minX, minY, width, height }) => {
    if (!map) return;

    // Get full map canvas
    const canvas = map.getCanvas();
    const dataUrl = canvas.toDataURL("image/png");

    // Account for high DPI / Retina displays
    const pixelRatio = window.devicePixelRatio || 1;

    const img = new Image();
    img.onload = () => {
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = width * pixelRatio;
      cropCanvas.height = height * pixelRatio;
      const ctx = cropCanvas.getContext("2d");

      // Draw the specific section of the full canvas onto the cropped canvas
      ctx.drawImage(
        img,
        minX * pixelRatio,
        minY * pixelRatio,
        width * pixelRatio,
        height * pixelRatio, // Source coordinates
        0,
        0,
        cropCanvas.width,
        cropCanvas.height // Destination coordinates
      );

      setCapturedImage(cropCanvas.toDataURL("image/png"));
      setModalOpen(true);
    };
    img.src = dataUrl;
  };

  const handleDownload = () => {
    if (!capturedImage) return;

    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `${fileName || "map-capture"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setModalOpen(false);
    setCapturedImage(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCapturedImage(null);
  };

  return (
    <>
      <Box mt={1}>
        <Tooltip
          title={isActive ? "Cancel Capture" : "Capture Area"}
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
                ? theme.palette.primary.main
                : "transparent",
              boxShadow: 1,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: `${theme.palette.text.primary} !important`,
                borderRadius: "24px",
              },
            }}
          >
            <CropIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Save Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Captured Area</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            mt={1}
          >
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Map Area"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  border: "1px solid #ccc",
                }}
              />
            )}
            <TextField
              fullWidth
              label="File Name"
              variant="outlined"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDownload} variant="contained" color="primary">
            Save Image
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CaptureAreaControl;
