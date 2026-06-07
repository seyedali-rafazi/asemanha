import { Box } from "@mui/material";
import { useState } from "react";
import RectangleButton from "./components/RectangleButton";
import RectangleDrawLogic from "./components/RectangleDrawLogic";

const DrawRectangleControl = () => {
  const [isRectMode, setIsRectMode] = useState(false);

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
