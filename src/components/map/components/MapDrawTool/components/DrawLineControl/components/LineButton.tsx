import { Timeline } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { FC } from "react";
import { getMapToolButtonSx } from "../../../../../utils/mapToolButtonStyles";

interface LineButtonProps {
  isDrawingLine: boolean;
  setIsDrawingLine: (val: boolean) => void;
}

const LineButton: FC<LineButtonProps> = ({
  isDrawingLine,
  setIsDrawingLine,
}) => {
  const theme = useTheme();

  return (
    <Tooltip
      title={
        isDrawingLine
          ? "Click on map to draw points, double click to finish"
          : "Draw Custom Line"
      }
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsDrawingLine(!isDrawingLine)}
        size="medium"
        sx={getMapToolButtonSx(theme, isDrawingLine)}
      >
        <Timeline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default LineButton;
