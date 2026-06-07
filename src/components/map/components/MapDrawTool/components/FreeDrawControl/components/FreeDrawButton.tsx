// src/components/ExpandableToolbar/components/DrawLineControl/LineButton.jsx
import { Gesture } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const FreeDrawButton = ({ isDrawingMode, setIsDrawingMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isDrawingMode ? "Stop Drawing" : "Free Draw Line"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsDrawingMode(!isDrawingMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isDrawingMode ? "white" : "text.secondary",
          backgroundColor: isDrawingMode
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
        <Gesture fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default FreeDrawButton;
