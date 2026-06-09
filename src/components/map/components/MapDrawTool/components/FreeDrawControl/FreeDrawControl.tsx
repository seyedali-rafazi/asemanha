import { Box } from "@mui/material";
import { useState } from "react";
import FreeDrawButton from "./components/FreeDrawButton";
import FreeDrawSettingsBar from "./components/FreeDrawSettingsBar";
import FreeDrawLogic from "./components/FreeDrawLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const FreeDrawControl = () => {
  const [isDrawingMode, setIsDrawingMode] = useExclusiveTool("freedraw");
  const [lineColor, setLineColor] = useState("#007cbf");
  const [lineWidth, setLineWidth] = useState(5);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <FreeDrawButton
        isDrawingMode={isDrawingMode}
        setIsDrawingMode={setIsDrawingMode}
      />

      {/* Renders the color/thickness settings if drawing mode is active */}
      {isDrawingMode && (
        <FreeDrawSettingsBar
          lineColor={lineColor}
          setLineColor={setLineColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
        />
      )}

      {/* Handles the actual mapbox drawing events */}
      <FreeDrawLogic
        isDrawingMode={isDrawingMode}
        lineColor={lineColor}
        lineWidth={lineWidth}
        setIsDrawingMode={setIsDrawingMode}
      />
    </Box>
  );
};

export default FreeDrawControl;
