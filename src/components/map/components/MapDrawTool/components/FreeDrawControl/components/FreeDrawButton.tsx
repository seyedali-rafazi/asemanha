import { Gesture } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { getMapToolButtonSx } from "../../../../../utils/mapToolButtonStyles";
import type { MapTool } from "../../../../../types/MapTypes";

interface FreeDrawButtonProps {
  isDrawingMode: boolean;
  setIsDrawingMode: Dispatch<SetStateAction<boolean>>;
  setActiveTool: Dispatch<SetStateAction<MapTool>>;
}

const FreeDrawButton = ({
  isDrawingMode,
  setIsDrawingMode,
  setActiveTool,
}: FreeDrawButtonProps) => {
  const theme = useTheme();

  const handleToggle = () => {
    const next = !isDrawingMode;
    setIsDrawingMode(next);
    setActiveTool(next ? "freedraw" : null);
  };

  return (
    <Tooltip
      title={isDrawingMode ? "Stop Drawing" : "Free Draw Line"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={handleToggle}
        size="medium"
        sx={getMapToolButtonSx(theme, isDrawingMode)}
      >
        <Gesture fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default FreeDrawButton;
