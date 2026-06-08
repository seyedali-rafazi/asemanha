import SquareFootIcon from "@mui/icons-material/SquareFoot";
import { IconButton, Tooltip, useTheme } from "@mui/material";

const RulerButton = ({ isRulerMode, setIsRulerMode }) => {
  const theme = useTheme();
  return (
    <Tooltip
      title={isRulerMode ? "Cancel Ruler" : "Measure Distance"}
      placement="left"
      arrow
    >
      <IconButton
        onClick={() => setIsRulerMode(!isRulerMode)}
        size="medium"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          color: isRulerMode ? "white" : "text.secondary",
          backgroundColor: isRulerMode
            ? theme.palette.primary.main
            : "transparent",
          boxShadow: 1,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
          },
        }}
      >
        <SquareFootIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

export default RulerButton;
