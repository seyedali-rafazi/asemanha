import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/mapbox";

const CompassControl = () => {
  const { current: map } = useMap();
  const [bearing, setBearing] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (!map) return;

    // Function to update bearing state
    const updateBearing = () => {
      setBearing(map.getBearing());
    };

    // Set initial bearing
    updateBearing();

    // Listen to map events
    map.on("rotate", updateBearing);
    map.on("load", updateBearing);

    // Cleanup listeners on unmount
    return () => {
      map.off("rotate", updateBearing);
      map.off("load", updateBearing);
    };
  }, [map]);

  // Reset map to point North when clicked
  const handleResetNorth = () => {
    if (map) {
      map.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
    }
  };

  return (
    <Box>
      <Tooltip title="Reset North" placement="left" arrow>
        <IconButton
          onClick={handleResetNorth}
          size="medium"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: "text.secondary",
            backgroundColor: "transparent",
            transition: "background-color 0.2s ease, border-radius 0.2s ease", // Exclude transform so the rotation is smooth
            "&:hover": {
              backgroundColor: `${theme.palette.text.primary} !important`,
              borderRadius: "24px",
            },
          }}
        >
          {/* Custom SVG Compass Needle */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{
              transform: `rotate(${-bearing}deg)`,
              transition: "transform 0.1s linear",
            }}
          >
            {/* North Pointer (Red) */}
            <path d="M12 2L8 12H16L12 2Z" fill="#d32f2f" />
            {/* South Pointer (Gray) */}
            <path d="M12 22L16 12H8L12 22Z" fill="#9e9e9e" />
          </svg>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CompassControl;
