import { Box } from "@mui/material";
import MarkerButton from "./components/MarkerButton";
import MarkerModal from "./components/MarkerModal";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawMarkerControl = () => {
  const [isDrawing, setIsDrawing] = useExclusiveTool("marker");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <MarkerButton isDrawing={isDrawing} setIsDrawing={setIsDrawing} />
      <MarkerModal isDrawing={isDrawing} setIsDrawing={setIsDrawing} />
    </Box>
  );
};

export default DrawMarkerControl;
