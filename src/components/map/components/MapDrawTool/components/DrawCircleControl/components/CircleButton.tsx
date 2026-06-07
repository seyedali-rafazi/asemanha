import { RadioButtonUnchecked } from "@mui/icons-material";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const CircleButton = ({ isCircleMode, setIsCircleMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isCircleMode ? "Cancel Circle Draw" : "Draw Circle"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsCircleMode(!isCircleMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isCircleMode ? "white" : "text.secondary",
          backgroundColor: isCircleMode
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
        <RadioButtonUnchecked fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default CircleButton;
