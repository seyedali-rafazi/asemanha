import type { Theme } from "@mui/material";

export function getMapToolButtonSx(theme: Theme, active = false) {
  return {
    width: 36,
    height: 36,
    borderRadius: "8px",
    color: active ? "white" : "text.secondary",
    backgroundColor: active ? theme.palette.primary.main : "transparent",
    boxShadow: 1,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: "white !important",
      opacity: active ? 1 : 0.85,
    },
  };
}

export function getMapToolAccordionButtonSx(
  theme: Theme,
  options: { expanded?: boolean; size?: number } = {}
) {
  const { expanded = false, size = 48 } = options;
  return {
    width: size,
    height: size,
    borderRadius: 0,
    color: expanded ? "primary.light" : "text.secondary",
    backgroundColor: expanded ? "rgba(25, 118, 210, 0.2)" : "transparent",
    "&:hover": {
      backgroundColor: `${theme.palette.primary.main} !important`,
      color: "white !important",
    },
  };
}
