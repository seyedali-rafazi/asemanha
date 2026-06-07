import { ContentCopy } from "@mui/icons-material";
import { Box, IconButton, Paper } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useMap, Popup } from "react-map-gl/mapbox"; // Import Popup
import LatCoordinate from "./components/LatCoordinate";
import LonCoordinate from "./components/LonCoordinate";
import { toast } from "sonner";

const CoordinateDisplay = () => {
  const { current: map } = useMap();
  const [coords, setCoords] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  // Handle Mouse Movement
  useEffect(() => {
    if (!map) return;

    const handleMouseMove = (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({
        lng: lng.toFixed(5),
        lat: lat.toFixed(5),
        rawLng: lng, // Keep raw numbers for the Popup position
        rawLat: lat,
      });
    };

    const handleMouseOut = () => setCoords(null);

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", handleMouseOut);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("mouseout", handleMouseOut);
    };
  }, [map]);

const handleMapClick = useCallback(
  (e: mapboxgl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied successful into your clipboard");
    });

    setIsPicking(false);
    // ✅ Access canvas directly from event to avoid stale `map` reference
    e.target.getCanvas().style.cursor = "";
  },
  // ✅ Remove `map` from deps — use `e.target` instead
  [setIsPicking]
);

useEffect(() => {
  if (!map) return;

  if (isPicking) {
    map.getCanvas().style.cursor = "crosshair";
    map.on("click", handleMapClick);
  } else {
    map.getCanvas().style.cursor = "";
    map.off("click", handleMapClick);
  }

  // ✅ Cleanup always removes the current handler reference
  return () => {
    map.off("click", handleMapClick);
  };
}, [isPicking, map, handleMapClick]);


  return (
    <>
      {/* Mapbox Native Popup Tooltip */}
      {isPicking && coords && (
        <Popup
          longitude={Number(coords.rawLng)}
          latitude={Number(coords.rawLat)}
          closeButton={false}
          closeOnClick={false}
          anchor="top-left"
          offset={15} // Distance from the cursor
          maxWidth="200px"
          style={{ pointerEvents: "none" }} // Crucial so click goes to map
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#333",
              whiteSpace: "nowrap",
            }}
          >
            Click on map to copy
          </div>
        </Popup>
      )}

      <Paper
        elevation={4}
        sx={{
          borderRadius: "16px",
          backdropFilter: "blur(12px)",
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
          padding: "0px 8px",
          width: "320px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          position: "relative", // Ensure it stays on top
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <LatCoordinate coords={coords} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => setIsPicking(!isPicking)}
              sx={{
                color: isPicking ? "primary.main" : "text.secondary",
                "&:hover": {
                  backgroundColor: "#8b8b8b8d !important",
                },
              }}
            >
              <ContentCopy
                sx={{
                  fontSize: "12px",
                }}
              />
            </IconButton>
          </Box>

          <LonCoordinate coords={coords} />
        </Box>
      </Paper>
    </>
  );
};

export default CoordinateDisplay;
