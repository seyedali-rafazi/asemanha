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
import { type FC, type ReactNode } from "react";
import {
  getMapToolAccordionButtonSx,
  getMapToolButtonSx,
} from "../../map/utils/mapToolButtonStyles";
import { useAccordionGroupItem } from "./AccordionGroupContext";

interface ExpandableBoxProps {
  children: ReactNode;
  accordionText: string;
  accordionIcon: ReactNode;
  id?: string;
  footer?: ReactNode;
}

const ExpandableBox: FC<ExpandableBoxProps> = ({
  children,
  accordionText,
  accordionIcon,
  id,
  footer,
}) => {
  const { expanded, setExpanded } = useAccordionGroupItem(id ?? accordionText);
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
            ...getMapToolAccordionButtonSx(theme, { expanded, size: 48 }),
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
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
            sx={getMapToolButtonSx(theme, false)}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Collapse>

      {footer && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            px: 0.5,
            pb: 0.5,
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
};

export default ExpandableBox;
