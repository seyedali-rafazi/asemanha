import { Box } from "@mui/material";
import MapboxMap from "../../components/map/AsemanhaMap";
import MapEntitiesLayer from "./components/MapEntitiesLayer/MapEntitiesLayer";
import MapItemPopup from "./components/MapItemPopup/MapItemPopup";

const HomePage = () => {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <MapboxMap>
        <MapEntitiesLayer />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 5,
            overflow: "hidden",
          }}
        >
          <MapItemPopup />
        </Box>
      </MapboxMap>
    </Box>
  );
};

export default HomePage;
