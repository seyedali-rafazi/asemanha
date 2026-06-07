// src/components/ExpandableToolbar/components/DrawLineControl/components/LineButton.jsx
import { LineAxis } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const IntersectionButton = ({ isLineMode, setIsLineMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isLineMode ? "Cancel Line Draw" : "Draw Intersecting Lines"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsLineMode(!isLineMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isLineMode ? "white" : "text.secondary",
          backgroundColor: isLineMode
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
        <LineAxis fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default IntersectionButton;
