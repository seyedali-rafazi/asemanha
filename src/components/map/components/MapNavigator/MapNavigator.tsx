import { Paper } from "@mui/material";
import FlyHome from "./components/FlyHome";
import LocateUser from "./components/LocateUser";
import ZoomControl from "./components/ZoomControl";
import BoxZoomControl from "./components/BoxZoomControl";

const MapNavigator = () => {
  return (
    <Paper
      elevation={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        backgroundColor: "background.paper",
        border: "1px solid rgba(255,255,255,0.6)",
        p: 0.5,
        gap: 0.5,
        width: "fit-content",
      }}
    >
      <FlyHome />
      <ZoomControl />
      <LocateUser />
      <BoxZoomControl />
    </Paper>
  );
};

export default MapNavigator;
