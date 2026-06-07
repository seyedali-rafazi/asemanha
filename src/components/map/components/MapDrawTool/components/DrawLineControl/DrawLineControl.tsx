import { Box } from "@mui/material";
import { useState } from "react";
import LineButton from "./components/LineButton";
import LineModal from "./components/LineModal";

const DrawLineControl = () => {
  const [isDrawingLine, setIsDrawingLine] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <LineButton
        isDrawingLine={isDrawingLine}
        setIsDrawingLine={setIsDrawingLine}
      />
      <LineModal
        isDrawingLine={isDrawingLine}
        setIsDrawingLine={setIsDrawingLine}
      />
    </Box>
  );
};

export default DrawLineControl;
