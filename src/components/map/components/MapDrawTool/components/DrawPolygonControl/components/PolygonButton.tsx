// src/components/ExpandableToolbar/components/DrawPolygonControl/PolygonButton.jsx
import { Hexagon } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const PolygonButton = ({ isPolyMode, setIsPolyMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isPolyMode ? "Cancel Polygon Draw" : "Draw Polygon"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsPolyMode(!isPolyMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isPolyMode ? "white" : "text.secondary",
          backgroundColor: isPolyMode
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
        <Hexagon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default PolygonButton;
