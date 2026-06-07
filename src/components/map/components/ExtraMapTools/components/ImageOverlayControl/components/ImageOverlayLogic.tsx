import { Box, Paper, Slider, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Marker } from "react-map-gl/mapbox";

const ImageOverlayLogic = ({
  images,
  setImages,
  activeImageId,
  setActiveImageId,
  isEraseMode,
}) => {
  if (!images || images.length === 0) return null;

  // Update a specific image in the array
  const updateImage = (id, key, value) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [key]: value } : img))
    );
  };

  // Remove a specific image
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (activeImageId === id) setActiveImageId(null);
  };

  const activeImage = images.find((img) => img.id === activeImageId);

  return (
    <>
      {/* Render All Images */}
      {images.map((image) => (
        <Marker
          key={image.id}
          longitude={image.lng}
          latitude={image.lat}
          anchor="center"
          draggable={!isEraseMode}
          onDragEnd={(e) => {
            updateImage(image.id, "lng", e.lngLat.lng);
            updateImage(image.id, "lat", e.lngLat.lat);
          }}
        >
          <Box
            onClick={(e) => {
              if (isEraseMode) {
                e.stopPropagation();
                removeImage(image.id);
              } else {
                e.stopPropagation();
                setActiveImageId(image.id); // Open controls for this specific image
              }
            }}
            sx={{
              cursor: isEraseMode ? "crosshair" : "grab",
              "&:active": { cursor: isEraseMode ? "crosshair" : "grabbing" },
            }}
          >
            <img
              src={image.src}
              alt="Map Overlay"
              draggable="false"
              style={{
                width: "300px",
                transform: `scale(${image.scale}) rotate(${image.rotation}deg)`,
                opacity: image.opacity,
                pointerEvents: "auto",
                transformOrigin: "center center",
                transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
                border: isEraseMode
                  ? "3px dashed red"
                  : activeImageId === image.id
                  ? "2px solid #1976d2" // Highlight active image slightly
                  : "none",
              }}
            />
          </Box>
        </Marker>
      ))}

      {/* Floating Control Panel (Only shows if an image is selected and NOT in erase mode) */}
      {!isEraseMode && activeImage && (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            top: 80,
            right: 20,
            width: 280,
            p: 2,
            zIndex: 1000,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              sx={{ color: "text.secondary" }}
              variant="subtitle2"
              fontWeight="bold"
            >
              Image Adjustments
            </Typography>
            <IconButton
              sx={{ color: "text.secondary" }}
              size="small"
              onClick={() => setActiveImageId(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ mb: 1, mt: 1, color: "text.secondary" }}>
            <Typography variant="caption">Scale</Typography>
            <Slider
              value={activeImage.scale}
              min={0.1}
              max={5}
              step={0.1}
              onChange={(e, val) => updateImage(activeImage.id, "scale", val)}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 1, color: "text.secondary" }}>
            <Typography variant="caption">Rotation ($^\circ$)</Typography>
            <Slider
              value={activeImage.rotation}
              min={0}
              max={360}
              step={1}
              onChange={(e, val) =>
                updateImage(activeImage.id, "rotation", val)
              }
              size="small"
            />
          </Box>

          <Box sx={{ mb: 1, color: "text.secondary" }}>
            <Typography variant="caption">Opacity</Typography>
            <Slider
              value={activeImage.opacity}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(e, val) => updateImage(activeImage.id, "opacity", val)}
              size="small"
            />
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ImageOverlayLogic;
