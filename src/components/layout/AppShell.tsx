import { Box } from "@mui/material";
import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LiveAircraftProvider } from "../../pages/Home/components/AircraftLayer/context/LiveAircraftContext";
import HomePage from "../../pages/Home/Home";

/**
 * Keeps the map mounted but paused when on other routes.
 * Destroying Mapbox + DeckGL on every navigation blocks the main thread for seconds.
 */
export default function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const homeMountedRef = useRef(isHome);

  if (isHome) {
    homeMountedRef.current = true;
  }

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
      {homeMountedRef.current && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            visibility: isHome ? "visible" : "hidden",
            pointerEvents: isHome ? "auto" : "none",
          }}
        >
          <LiveAircraftProvider active={isHome}>
            <HomePage mapActive={isHome} />
          </LiveAircraftProvider>
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
          // On home the Outlet renders nothing, so let clicks/drags fall
          // through to the map underneath instead of being swallowed here.
          pointerEvents: isHome ? "none" : "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
