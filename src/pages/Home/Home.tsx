import { Box } from "@mui/material";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MapboxMap from "../../components/map/AsemanhaMap";
import MapEntitiesLayer from "./components/MapEntitiesLayer/MapEntitiesLayer";
import MapItemPopup from "./components/MapItemPopup/MapItemPopup";
import { useMapLayers } from "./context/MapLayersContext";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectEntity } = useMapLayers();

  useEffect(() => {
    const aircraftId = searchParams.get("select");
    if (!aircraftId) return;

    selectEntity("airplanes", aircraftId);
    setSearchParams({}, { replace: true });
  }, [searchParams, selectEntity, setSearchParams]);

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
