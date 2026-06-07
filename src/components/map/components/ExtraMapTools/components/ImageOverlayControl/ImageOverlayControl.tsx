import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";
import ImageOverlayButton from "./components/ImageOverlayButton";
import ImageOverlayLogic from "./components/ImageOverlayLogic";
import ImageOverlayModal from "./components/ImageOverlayModal";

const ImageOverlayControl = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]); // Array to hold multiple images
  const [activeImageId, setActiveImageId] = useState(null); // Tracks which image is selected for adjustments
  const [isEraseMode, setIsEraseMode] = useState(false);

  const handleToggleMenu = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const isMenuOpen = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Main Toolbar Button */}
      <Tooltip title="Image Overlay Tools" placement="left" arrow>
        <IconButton
          onClick={handleToggleMenu}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: "text.secondary",
            backgroundColor: isMenuOpen
              ? theme.palette.primary.main
              : "transparent",
            "&:hover": {
              backgroundColor: `${theme.palette.text.primary} !important`,
              color: "white",
            },
            boxShadow: 1,
          }}
        >
          <AddPhotoAlternateIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Popper Menu */}
      <ImageOverlayButton
        anchorEl={anchorEl}
        isEraseMode={isEraseMode}
        isMenuOpen={isMenuOpen}
        setActiveImageId={setActiveImageId}
        setAnchorEl={setAnchorEl}
        setIsEraseMode={setIsEraseMode}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Upload Modal */}
      <ImageOverlayModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(config) => {
          const newImage = { ...config, id: Date.now() }; // Give new image a unique ID
          setImages((prev) => [...prev, newImage]);
          setActiveImageId(newImage.id); // Automatically select the newly uploaded image
          setIsModalOpen(false);
          setIsEraseMode(false);
        }}
      />

      {/* Image Renderer & Logic */}
      <ImageOverlayLogic
        images={images}
        setImages={setImages}
        activeImageId={activeImageId}
        setActiveImageId={setActiveImageId}
        isEraseMode={isEraseMode}
      />
    </Box>
  );
};

export default ImageOverlayControl;
