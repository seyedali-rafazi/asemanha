import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useState, type FC, type ReactNode } from "react";

interface ExpandableBoxProps {
  children: ReactNode;
  accordionText: string;
  accordionIcon: ReactNode;
}

const ExpandableBox: FC<ExpandableBoxProps> = ({
  children,
  accordionText,
  accordionIcon,
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  return (
    <Paper
      elevation={4}
      sx={{
        width: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 2,
        backgroundColor: "background.paper",
      }}
    >
      {/* Main Toggle Button (Always visible) */}
      <Tooltip title="Draw Tools" placement="left" disableInteractive>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
            // Slight background change when open to indicate active state
            color: "text.secondary",
            backgroundColor: expanded ? "action.selected" : "transparent",
            "&:hover": {
              backgroundColor: `${theme.palette.text.primary} !important`,
            },
          }}
        >
          {accordionIcon}
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.55rem",
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
          >
            {accordionText}
          </Typography>
        </IconButton>
      </Tooltip>

      {/* Smooth Vertical Animation */}
      <Collapse in={expanded} timeout="auto">
        <Stack
          direction="column"
          alignItems="center"
          spacing={1}
          sx={{ pb: 0.5, pt: 1 }}
        >
          {/* Tools */}
          {children}

          {/* Divider line before close arrow */}
          <Box
            sx={{ width: "60%", height: "1px", bgcolor: "divider", my: 0.5 }}
          />

          {/* Close Arrow */}
          <IconButton
            size="small"
            onClick={() => setExpanded(false)}
            sx={{
              color: theme.palette.common.white,
              "&:hover": {
                backgroundColor: `${theme.palette.text.primary} !important`,
              },
            }}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default ExpandableBox;
