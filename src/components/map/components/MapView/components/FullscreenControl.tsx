import { Box, Tooltip, IconButton, useTheme } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useState, useEffect } from "react";
import { useMap } from "react-map-gl/mapbox"; // Import useMap

const FullscreenControl = () => {
  const theme = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get the current map instance
  const { current: map } = useMap();

  // Function to toggle fullscreen mode for the map container only
  const toggleFullscreen = () => {
    if (!map) return; // Safety check

    // Get the specific HTML element that contains the map
    const mapContainer = map.getContainer();

    if (!document.fullscreenElement) {
      // Enter fullscreen on the map container
      mapContainer.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for 'Esc' key or browser fullscreen changes to keep state in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Tooltip
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        placement="left"
        arrow
      >
        <IconButton
          onClick={toggleFullscreen}
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
            },
            boxShadow: 1,
          }}
        >
          {isFullscreen ? (
            <FullscreenExitIcon fontSize="small" />
          ) : (
            <FullscreenIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default FullscreenControl;
