import { AddLocationAlt } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { FC } from "react";
import { getMapToolButtonSx } from "../../../../../utils/mapToolButtonStyles";
import type { MarkerButtonProps } from "../types/MarkerType";

const MarkerButton: FC<MarkerButtonProps> = ({ isDrawing, setIsDrawing }) => {
  const theme = useTheme();

  const handleToggle = () => {
    setIsDrawing(!isDrawing);
  };

  return (
    <Tooltip
      title={isDrawing ? "Click on map to place marker" : "Draw Custom Marker"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={handleToggle}
        size="medium"
        sx={getMapToolButtonSx(theme, isDrawing)}
      >
        <AddLocationAlt fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default MarkerButton;
