// src/components/ExpandableToolbar/components/DrawRectangleControl/RectangleButton.jsx
import { CropSquare } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const RectangleButton = ({ isRectMode, setIsRectMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isRectMode ? "Cancel Rect Draw" : "Draw Rectangle"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsRectMode(!isRectMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isRectMode ? "white" : "text.secondary",
          backgroundColor: isRectMode ? theme.palette.primary.main : "transparent",
          boxShadow: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: `${theme.palette.primary.main} !important`,
            color: "white",
          },
        }}
      >
        <CropSquare fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default RectangleButton;
