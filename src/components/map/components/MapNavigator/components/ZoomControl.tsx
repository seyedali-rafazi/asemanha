// src/components/ZoomControl.jsx
import { useMap } from "react-map-gl/mapbox";
import {
  Box,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CompassControl from "./CompassControl";

const ZoomControl = () => {
  const { current: map } = useMap();
  const theme = useTheme();

  const handleZoomIn = () => {
    if (map) map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut({ duration: 300 });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#353535ff",
        borderRadius: "24px",
      }}
    >
      {/* Zoom In Button */}
      <Tooltip title="Zoom In" placement="left" arrow>
        <IconButton
          onClick={handleZoomIn}
          size="medium"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: "text.secondary",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
              transform: "scale(1.1)",
              borderRadius: "24px",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <CompassControl />

      {/* Zoom Out Button */}
      <Tooltip title="Zoom Out" placement="left" arrow>
        <IconButton
          onClick={handleZoomOut}
          size="medium"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: "text.secondary",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
              transform: "scale(1.1)",
              borderRadius: "24px",
            },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ZoomControl;
