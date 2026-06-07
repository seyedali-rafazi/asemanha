import { Timeline } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import type { FC } from "react";

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
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isDrawingLine ? "white" : "text.secondary",
          backgroundColor: isDrawingLine
            ? theme.palette.primary.main
            : "transparent",
          boxShadow: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: `${theme.palette.text.primary} !important`,
            color: "white",
          },
        }}
      >
        <Timeline fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default LineButton;
