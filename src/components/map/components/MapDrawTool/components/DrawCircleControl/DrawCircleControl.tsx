// src/components/ExpandableToolbar/components/DrawCircleControl/DrawCircleControl.jsx
import { Box } from "@mui/material";
import CircleButton from "./components/CircleButton";
import CircleDrawLogic from "./components/CircleDrawLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawCircleControl = () => {
  const [isCircleMode, setIsCircleMode] = useExclusiveTool("circle");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <CircleButton
        isCircleMode={isCircleMode}
        setIsCircleMode={setIsCircleMode}
      />
      <CircleDrawLogic
        isCircleMode={isCircleMode}
        setIsCircleMode={setIsCircleMode}
      />
    </Box>
  );
};

export default DrawCircleControl;
