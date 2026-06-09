import { AirplanemodeActive } from "@mui/icons-material";
import { Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useLiveAircraftEngine } from "../AircraftLayer/context/LiveAircraftContext";
import { useMapLayers } from "../../context/MapLayersContext";

export default function MapAircraftBadge() {
  const { current: mapRef } = useMap();
  const { getSnapshot } = useLiveAircraftEngine();
  const { isItemVisible } = useMapLayers();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const recompute = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      let visible = 0;
      for (const aircraft of getSnapshot()) {
        if (
          isItemVisible("airplanes", aircraft.id) &&
          bounds.contains([aircraft.lon, aircraft.lat])
        ) {
          visible += 1;
        }
      }
      setCount(visible);
    };

    recompute();
    // `move` keeps it accurate while panning/zooming; the interval catches the
    // aircraft drifting in/out of view while the map sits still.
    const interval = window.setInterval(recompute, 1000);
    map.on("move", recompute);

    return () => {
      window.clearInterval(interval);
      map.off("move", recompute);
    };
  }, [mapRef, getSnapshot, isItemVisible]);

  return (
    <Tooltip title="Aircraft in current view" placement="left" arrow>
      <Paper
        elevation={4}
        sx={{
          display: "flex",
          flexDirection:'column',
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          minWidth: 36,
          p: 1,
          mb: 1,
          borderRadius: "8px",
          backgroundColor: "background.paper",
          color: "text.secondary",
        }}
      >
        <AirplanemodeActive sx={{ fontSize: 16, transform: "rotate(45deg)" }} />
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
          {count}
        </Typography>
      </Paper>
    </Tooltip>
  );
}
