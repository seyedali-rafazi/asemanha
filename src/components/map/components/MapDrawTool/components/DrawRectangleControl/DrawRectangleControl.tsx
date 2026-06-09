import { Box } from "@mui/material";
import RectangleButton from "./components/RectangleButton";
import RectangleDrawLogic from "./components/RectangleDrawLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawRectangleControl = () => {
  const [isRectMode, setIsRectMode] = useExclusiveTool("rectangle");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <RectangleButton isRectMode={isRectMode} setIsRectMode={setIsRectMode} />

      <RectangleDrawLogic
        isRectMode={isRectMode}
        setIsRectMode={setIsRectMode}
      />
    </Box>
  );
};

export default DrawRectangleControl;
