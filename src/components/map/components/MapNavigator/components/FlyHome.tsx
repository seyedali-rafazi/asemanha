import { HomeFilled } from "@mui/icons-material";
import { Box, IconButton, Tooltip, useTheme, useMediaQuery } from "@mui/material";
import { useMap } from "react-map-gl/maplibre";
import {
  MIDDLE_EAST_DESKTOP_VIEW,
  MIDDLE_EAST_MOBILE_VIEW,
} from "../../../utils/mapDefaults";

const FlyHome = () => {
  const { current: map } = useMap();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleFlyhome = () => {
    if (!map) return;
    const view = isMobile ? MIDDLE_EAST_MOBILE_VIEW : MIDDLE_EAST_DESKTOP_VIEW;
    map.flyTo({
      center: [view.longitude, view.latitude],
      zoom: view.zoom,
      speed: 1,
      curve: 1,
    });
  };

  return (
    <Box>
      <Tooltip title="Middle East (Home)" placement="left" arrow>
        <IconButton
          onClick={handleFlyhome}
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
          <HomeFilled fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default FlyHome;
