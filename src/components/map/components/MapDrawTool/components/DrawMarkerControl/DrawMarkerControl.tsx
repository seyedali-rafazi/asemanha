import { Box } from "@mui/material";
import { useState } from "react";
import MarkerButton from "./components/MarkerButton";
import MarkerModal from "./components/MarkerModal";
import type { ToolProps } from "../../../../types/MapTypes";

const DrawMarkerControl: React.FC<ToolProps> = ({
  activeTool,
  setActiveTool,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <MarkerButton
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
      <MarkerModal
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
    </Box>
  );
};

export default DrawMarkerControl;
