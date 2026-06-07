import { AddLocationAlt } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { FC } from "react";
import type { MarkerButtonProps } from "../types/MarkerType";

const MarkerButton: FC<MarkerButtonProps> = ({
  isDrawing,
  setIsDrawing,
  activeTool,
  setActiveTool,
}) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isDrawing ? "Click on map to place Omarker" : "Draw Custom Marker"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsDrawing(!isDrawing)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isDrawing ? "white" : "text.secondary",
          boxShadow: 1,
          transition: "all 0.2s ease",
          backgroundColor: isDrawing
            ? theme.palette.primary.main
            : "transparent",
          "&:hover": {
            backgroundColor: `${theme.palette.text.primary} !important`,
          },
        }}
      >
        <AddLocationAlt fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default MarkerButton;
