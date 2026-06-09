import { Box } from "@mui/material";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MapboxMap from "../../components/map/AsemanhaMap";
import MapActivityController from "../../components/map/components/MapActivityController/MapActivityController";
import MapEntitiesLayer from "./components/MapEntitiesLayer/MapEntitiesLayer";
import MapFocusController from "./components/MapFocusController/MapFocusController";
import MapItemPopup from "./components/MapItemPopup/MapItemPopup";
import { useMapLayers } from "./context/MapLayersContext";

interface HomePageProps {
  mapActive?: boolean;
}

const HomePage = ({ mapActive = true }: HomePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { focusEntity } = useMapLayers();

  useEffect(() => {
    const aircraftId = searchParams.get("select");
    if (!aircraftId) return;

    focusEntity("airplanes", aircraftId);
    setSearchParams({}, { replace: true });
  }, [searchParams, focusEntity, setSearchParams]);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <MapboxMap>
        <MapActivityController active={mapActive} />
        <MapFocusController />
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
