import { Box } from "@mui/material";
import LineButton from "./components/LineButton";
import LineModal from "./components/LineModal";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const DrawLineControl = () => {
  const [isDrawingLine, setIsDrawingLine] = useExclusiveTool("line");

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
