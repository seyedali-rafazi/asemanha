import AutoFixOffIcon from "@mui/icons-material/AutoFixOff";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Fade, IconButton, Paper, Popper, Tooltip } from "@mui/material";

const ImageOverlayButton = ({
  isMenuOpen,
  anchorEl,
  setIsModalOpen,
  setAnchorEl,
  isEraseMode,
  setIsEraseMode,
  setActiveImageId,
}) => {
  return (
    <Popper
      open={isMenuOpen}
      anchorEl={anchorEl}
      placement="right"
      transition
      sx={{ zIndex: 1200, ml: 1 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            sx={{
              display: "flex",
              gap: 0.5,
              p: 0.5,
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <Tooltip title="Upload Photo" placement="top">
              <IconButton
                size="small"
                color="primary"
                onClick={() => {
                  setIsModalOpen(true);
                  setAnchorEl(null);
                }}
              >
                <UploadFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={isEraseMode ? "Erase Mode: ON" : "Erase Tool"}
              placement="top"
            >
              <IconButton
                size="small"
                color={"error"}
                sx={{
                  backgroundColor: isEraseMode ? "error.light" : "transparent",
                }}
                onClick={() => {
                  const newEraseMode = !isEraseMode;
                  setIsEraseMode(newEraseMode);
                  if (newEraseMode) setActiveImageId(null); // Close adjustments when erasing
                  setAnchorEl(null);
                }}
              >
                <AutoFixOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default ImageOverlayButton;
