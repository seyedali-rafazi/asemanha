import { MyLocation } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useMap } from "react-map-gl/mapbox";
import { useState } from "react";
import { toast } from "sonner";

const LocateUser = () => {
  const { current: map } = useMap();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleLocate = async () => {
    if (!map) return;

    setLoading(true);
    try {
      // Fetching location based on IP using a free service
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data.latitude && data.longitude) {
        map.flyTo({
          center: [data.longitude, data.latitude],
          zoom: 12,
          speed: 1.5,
          curve: 1,
        });
      } else {
        console.error("Location data not available");
      }
    } catch (error) {
      toast.error("Error fetching IP location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Tooltip title="Locate me (IP)" placement="left" arrow>
        <IconButton
          onClick={handleLocate}
          disabled={loading}
          size="medium"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: "text.secondary",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: `${theme.palette.text.primary} !important`,
              color: "white",
              transform: "scale(1.1)",
              borderRadius: "24px",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "text.secondary" }} />
          ) : (
            <MyLocation fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LocateUser;
