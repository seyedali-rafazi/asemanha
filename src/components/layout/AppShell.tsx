import { Box } from "@mui/material";
import { useRef } from "react";
import { Outlet, useLocation, useOutlet } from "react-router-dom";
import HomePage from "../../pages/Home/Home";

/**
 * Keeps the map mounted but paused when on other routes.
 * Destroying MapLibre + DeckGL on every navigation blocks the main thread for seconds.
 */
export default function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      {isHome && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
          }}
        >
          <HomePage mapActive={true} />
        </Box>
      )}

      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          zIndex: isHome ? 0 : 1,
          bgcolor: isHome ? "transparent" : "background.default",
          overflow: isHome ? "hidden" : "auto",
          pointerEvents: isHome ? "none" : "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
