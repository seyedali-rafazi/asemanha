import {
  AirplanemodeActive,
  CellTower,
  Close,
  Flight,
  Route,
  Speed,
  Terrain,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-map-gl/mapbox";
import { useAircraft } from "../AircraftLayer/context/AircraftContext";
import { getAircraftImage } from "../AircraftLayer/utils/getAircraftImage";
import type { Aircraft } from "../AircraftLayer/types/Aircraft";
import type { Airport } from "../AirportLayer/types/Airport";
import type { Antenna } from "../AntennaLayer/types/Antenna";
import { useMapLayers } from "../../context/MapLayersContext";
import { usePopupScreenPosition } from "../AircraftLayer/hooks/usePopupScreenPosition";
import { POPUP_WIDTH } from "../AircraftLayer/utils/getPopupScreenPosition";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function AircraftPopupContent({
  aircraft,
  onClose,
}: {
  aircraft: Aircraft;
  onClose: () => void;
}) {
  const { addTrack, hasTrack } = useAircraft();
  const trackExists = hasTrack(aircraft.id);

  return (
    <>
      <Box sx={{ position: "relative", height: 90 }}>
        <Box
          component="img"
          src={getAircraftImage(aircraft.aircraftType)}
          alt={aircraft.aircraftType}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(29,31,32,0.9) 0%, transparent 70%)",
          }}
        />
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            p: 0.5,
          }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
        <Box sx={{ position: "absolute", bottom: 8, left: 10 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <AirplanemodeActive sx={{ color: "primary.main", fontSize: 16 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#fff">
              {aircraft.callsign}
            </Typography>
            <Chip label={aircraft.aircraftType} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
          </Stack>
          <Typography variant="caption" color="rgba(255,255,255,0.75)">
            {aircraft.airline}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Stack direction="row" spacing={1} mb={1}>
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "grey.A100", textAlign: "center" }}>
            <Terrain sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" color="text.secondary">Alt</Typography>
            <Typography variant="caption" fontWeight={700}>{aircraft.altitude_ft.toLocaleString()} ft</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "grey.A100", textAlign: "center" }}>
            <Speed sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" color="text.secondary">Speed</Typography>
            <Typography variant="caption" fontWeight={700}>{aircraft.speed_kts} kts</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "grey.A100", textAlign: "center" }}>
            <Route sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" color="text.secondary">Hdg</Typography>
            <Typography variant="caption" fontWeight={700}>{aircraft.heading_deg}°</Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 0.75 }} />
        <InfoRow label="Flight ID" value={aircraft.id} />
        <InfoRow label="Origin" value={aircraft.origin_city} />
        <InfoRow label="Destination" value={aircraft.destination_city} />
        <InfoRow label="Position" value={`${aircraft.lat.toFixed(3)}°, ${aircraft.lon.toFixed(3)}°`} />
        <Button
          fullWidth
          size="small"
          variant={trackExists ? "outlined" : "contained"}
          startIcon={<Route />}
          disabled={trackExists}
          onClick={() => addTrack(aircraft.id)}
          sx={{ mt: 1.25, py: 0.75, fontWeight: 600 }}
        >
          {trackExists ? "Track Drawn" : "Draw Track"}
        </Button>
      </Box>
    </>
  );
}

function AirportPopupContent({
  airport,
  onClose,
}: {
  airport: Airport;
  onClose: () => void;
}) {
  return (
    <>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: "rgba(25,118,210,0.15)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
              <Flight sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {airport.name}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {airport.city}, {airport.country}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <InfoRow label="IATA" value={airport.iata} />
        <InfoRow label="ICAO" value={airport.icao} />
        <InfoRow label="Elevation" value={`${airport.elevation_ft.toLocaleString()} ft`} />
        <InfoRow label="Runways" value={airport.runways} />
        <InfoRow label="Position" value={`${airport.lat.toFixed(3)}°, ${airport.lon.toFixed(3)}°`} />
      </Box>
    </>
  );
}

function AntennaPopupContent({
  antenna,
  onClose,
}: {
  antenna: Antenna;
  onClose: () => void;
}) {
  return (
    <>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: "rgba(124,58,237,0.15)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
              <CellTower sx={{ color: "#a78bfa", fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                {antenna.name}
              </Typography>
            </Stack>
            <Chip
              label={antenna.type}
              size="small"
              sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#7c3aed", color: "#fff" }}
            />
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <InfoRow label="Frequency" value={antenna.frequency} />
        <InfoRow label="Range" value={`${antenna.range_km} km`} />
        <InfoRow label="Operator" value={antenna.operator} />
        <InfoRow label="Status" value={antenna.status} />
        <InfoRow label="Position" value={`${antenna.lat.toFixed(3)}°, ${antenna.lon.toFixed(3)}°`} />
      </Box>
    </>
  );
}

export default function MapItemPopup() {
  const { current: mapRef } = useMap();
  const { selectedEntity, selectEntity, getSelectedEntityData } = useMapLayers();
  const skipCloseRef = useRef(false);

  const entity = getSelectedEntityData();

  const lonLat = useMemo(() => {
    if (!entity || !("lat" in entity) || !("lon" in entity)) return null;
    return { lon: entity.lon, lat: entity.lat };
  }, [entity]);

  const position = usePopupScreenPosition(lonLat);

  useEffect(() => {
    if (!selectedEntity) return;

    skipCloseRef.current = true;
    const timer = window.setTimeout(() => {
      skipCloseRef.current = false;
    }, 150);

    const map = mapRef?.getMap();
    if (!map) return () => window.clearTimeout(timer);

    const handleMapClick = () => {
      if (skipCloseRef.current) return;
      selectEntity(selectedEntity.category, null);
    };

    map.on("click", handleMapClick);
    return () => {
      window.clearTimeout(timer);
      map.off("click", handleMapClick);
    };
  }, [selectedEntity, mapRef, selectEntity]);

  if (!selectedEntity || !entity || !position) return null;

  const handleClose = () => selectEntity(selectedEntity.category, null);

  return (
    <Box
      sx={{
        position: "absolute",
        left: position.left,
        top: position.top,
        width: POPUP_WIDTH,
        zIndex: 10,
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box
        sx={{
          bgcolor: "#1d1f20",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        }}
      >
        {selectedEntity.category === "airplanes" && (
          <AircraftPopupContent aircraft={entity as Aircraft} onClose={handleClose} />
        )}
        {selectedEntity.category === "airports" && (
          <AirportPopupContent airport={entity as Airport} onClose={handleClose} />
        )}
        {selectedEntity.category === "antennas" && (
          <AntennaPopupContent antenna={entity as Antenna} onClose={handleClose} />
        )}
      </Box>
    </Box>
  );
}
