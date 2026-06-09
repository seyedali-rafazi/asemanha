import { Box } from "@mui/material";
import RulerButton from "./components/RulerButton";
import RulerLogic from "./components/RulerLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawRulerControl = () => {
  const [isRulerMode, setIsRulerMode] = useExclusiveTool("ruler");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <RulerButton isRulerMode={isRulerMode} setIsRulerMode={setIsRulerMode} />
      <RulerLogic isRulerMode={isRulerMode} setIsRulerMode={setIsRulerMode} />
    </Box>
  );
};

export default DrawRulerControl;
