import { Gesture } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { getMapToolButtonSx } from "../../../../../utils/mapToolButtonStyles";

interface FreeDrawButtonProps {
  isDrawingMode: boolean;
  setIsDrawingMode: Dispatch<SetStateAction<boolean>>;
}

const FreeDrawButton = ({
  isDrawingMode,
  setIsDrawingMode,
}: FreeDrawButtonProps) => {
  const theme = useTheme();

  const handleToggle = () => {
    setIsDrawingMode(!isDrawingMode);
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
