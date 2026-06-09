// src/components/ExpandableToolbar/components/DrawLineControl/DrawLineControl.jsx
import { Box } from "@mui/material";
import IntersectionButton from "./components/IntersectionButton";
import IntersectionLogic from "./components/IntersectionLogic";
import { useExclusiveTool } from "../../../../context/MapToolContext";

const IntersectionControl = () => {
  const [isLineMode, setIsLineMode] = useExclusiveTool("intersection");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <IntersectionButton
        isLineMode={isLineMode}
        setIsLineMode={setIsLineMode}
      />
      <IntersectionLogic
        isLineMode={isLineMode}
        setIsLineMode={setIsLineMode}
      />
    </Box>
  );
};

export default IntersectionControl;
