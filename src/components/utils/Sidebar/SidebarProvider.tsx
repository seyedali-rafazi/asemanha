import { Close } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const COLLAPSED_WIDTH = 72;
export const EXPANDED_WIDTH = 360;
const PANEL_WIDTH = EXPANDED_WIDTH - COLLAPSED_WIDTH;

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children, config }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeComponentId, setActiveComponentId] = useState(null);

  const openSidebar = useCallback((id) => {
    const item = config.find((i) => i.id === id);
    if (item && item.component) {
      setIsExpanded(true);
      setActiveComponentId(id);
    }
  }, [config]);

  const closeSidebar = useCallback(() => {
    setIsExpanded(false);
    setActiveComponentId(null);
  }, []);

  const toggleSidebar = useCallback((id) => {
    if (isExpanded && activeComponentId === id) {
      closeSidebar();
    } else {
      openSidebar(id);
    }
  }, [isExpanded, activeComponentId, closeSidebar, openSidebar]);

  const handleSidebarClick = useCallback((item) => {
    if (item.navigate) {
      closeSidebar();
      navigate(item.navigate);
    } else if (item.component) {
      toggleSidebar(item.id);
    }
  }, [closeSidebar, navigate, toggleSidebar]);

  const topItems = config.filter(
    (item) => item.position === "top" || !item.position
  );
  const bottomItems = config.filter((item) => item.position === "bottom");

  const activeItem = config.find((i) => i.id === activeComponentId);

  const renderList = (items) => (
    <List sx={{ px: 0.75 }}>
      {items.map((item) => {
        const isActive =
          activeComponentId === item.id ||
          location.pathname === item.navigate ||
          (item.navigate &&
            item.navigate !== "/" &&
            location.pathname.startsWith(item.navigate));

        return (
          <ListItem key={item.id} disablePadding sx={{ display: "block", mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleSidebarClick(item)}
              sx={{
                minHeight: 56,
                justifyContent: "center",
                flexDirection: "column",
                px: 0.5,
                py: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                bgcolor: isActive ? "rgba(25, 118, 210, 0.15)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor: isActive
                    ? "rgba(25, 118, 210, 0.2)"
                    : "rgba(255, 255, 255, 0.06)",
                },
                color: isActive ? "primary.main" : "text.secondary",
                "& .MuiSvgIcon-root": {
                  fontSize: 22,
                  mb: 0.25,
                  transition: "color 0.2s ease",
                },
              }}
            >
              {item.icon}
              <ListItemText
                primary={item.textButton}
                primaryTypographyProps={{
                  variant: "caption",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.65rem",
                  color: isActive ? "primary.main" : "text.secondary",
                  lineHeight: 1.2,
                }}
                sx={{ m: 0, textAlign: "center" }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const contextValue = useMemo(
    () => ({
      isExpanded,
      sidebarWidth: COLLAPSED_WIDTH,
      activeComponentId,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [isExpanded, activeComponentId, openSidebar, closeSidebar, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <Box sx={{ display: "flex", height: "100%", width: "100%", overflow: "hidden" }}>
        <Box
          sx={{
            width: COLLAPSED_WIDTH,
            flexShrink: 0,
            height: "100%",
            position: "relative",
            zIndex: 1400,
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: COLLAPSED_WIDTH,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              py: 2,
              bgcolor: "#16181a",
              borderRight: "1px solid",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <Box>{renderList(topItems)}</Box>
            <Box>{renderList(bottomItems)}</Box>
          </Box>

          <Box
            sx={{
              position: "fixed",
              left: COLLAPSED_WIDTH,
              top: 0,
              bottom: 0,
              width: PANEL_WIDTH,
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              bgcolor: "#1a1d1f",
              borderRight: "1px solid",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: isExpanded ? "8px 0 32px rgba(0,0,0,0.45)" : "none",
              transform: isExpanded ? "translateX(0)" : `translateX(-${PANEL_WIDTH}px)`,
              visibility: isExpanded ? "visible" : "hidden",
              transition:
                "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, visibility 0.3s",
              pointerEvents: isExpanded ? "auto" : "none",
              overflow: "hidden",
            }}
          >
            {activeItem && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2.5,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {activeItem.textButton}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={closeSidebar}
                    sx={{
                      color: "text.secondary",
                      bgcolor: "rgba(255, 255, 255, 0.06)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.12)" },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    px: 2.5,
                    py: 2,
                    color: "text.primary",
                    minHeight: 0,
                  }}
                >
                  {activeItem.component}
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </SidebarContext.Provider>
  );
};
