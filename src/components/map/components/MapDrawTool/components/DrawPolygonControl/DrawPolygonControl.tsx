import { Box } from "@mui/material";
import PolygonButton from "./components/PolygonButton";
import PolygonDrawLogic from "./components/PolygonDrawLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawPolygonControl = () => {
  const [isPolyMode, setIsPolyMode] = useExclusiveTool("polygon");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <PolygonButton isPolyMode={isPolyMode} setIsPolyMode={setIsPolyMode} />
      <PolygonDrawLogic isPolyMode={isPolyMode} setIsPolyMode={setIsPolyMode} />
    </Box>
  );
};

export default DrawPolygonControl;
