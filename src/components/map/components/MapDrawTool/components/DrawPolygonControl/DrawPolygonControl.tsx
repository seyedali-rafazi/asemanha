import { Box } from "@mui/material";
import { useState } from "react";
import PolygonButton from "./components/PolygonButton";
import PolygonDrawLogic from "./components/PolygonDrawLogic";

const DrawPolygonControl = () => {
  const [isPolyMode, setIsPolyMode] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <PolygonButton isPolyMode={isPolyMode} setIsPolyMode={setIsPolyMode} />
      <PolygonDrawLogic isPolyMode={isPolyMode} setIsPolyMode={setIsPolyMode} />
    </Box>
  );
};

export default DrawPolygonControl;
