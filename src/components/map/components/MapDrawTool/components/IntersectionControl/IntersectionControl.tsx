// src/components/ExpandableToolbar/components/DrawLineControl/DrawLineControl.jsx
import { Box } from "@mui/material";
import { useState } from "react";
import IntersectionButton from "./components/IntersectionButton";
import IntersectionLogic from "./components/IntersectionLogic";

const IntersectionControl = () => {
  const [isLineMode, setIsLineMode] = useState(false);

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
