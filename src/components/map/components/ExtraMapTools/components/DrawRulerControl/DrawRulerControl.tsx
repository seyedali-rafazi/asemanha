import { Box } from "@mui/material";
import { useState } from "react";
import RulerButton from "./components/RulerButton";
import RulerLogic from "./components/RulerLogic";

const DrawRulerControl = () => {
  const [isRulerMode, setIsRulerMode] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <RulerButton isRulerMode={isRulerMode} setIsRulerMode={setIsRulerMode} />
      <RulerLogic isRulerMode={isRulerMode} setIsRulerMode={setIsRulerMode} />
    </Box>
  );
};

export default DrawRulerControl;
