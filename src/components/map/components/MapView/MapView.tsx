import { Paper } from "@mui/material";
import FullscreenControl from "./components/FullscreenControl";

const MapView = () => {
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
      <FullscreenControl />
    </Paper>
  );
};

export default MapView;
