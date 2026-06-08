import { useState } from "react";
import { Box, Popover, IconButton, Tooltip, useTheme } from "@mui/material";
import { GpsFixed } from "@mui/icons-material";
import GoToForm from "./components/GoToForm";

const GoToControl = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Tooltip
        title={open ? "Close panel" : "Go to Coordinates"}
        placement="left"
        arrow
      >
        <IconButton
          onClick={handleClick}
          size="medium"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            color: open ? "white" : "text.secondary",
            backgroundColor: open ? theme.palette.primary.main : "transparent",
            boxShadow: 1,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: "white",
            },
          }}
        >
          <GpsFixed fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "center",
          horizontal: "left", // Opens to the left of the button
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        sx={{ ml: -1 }} // Small margin to separate from the toolbar
      >
        <GoToForm onClose={handleClose} />
      </Popover>
    </Box>
  );
};

export default GoToControl;
