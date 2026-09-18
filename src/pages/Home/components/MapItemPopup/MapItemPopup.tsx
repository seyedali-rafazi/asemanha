import {
  AirplanemodeActive,
  CellTower,
  Close,
  Delete,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useAircraft } from "../AircraftLayer/context/AircraftContext";
import { useLiveAircraftEngine } from "../AircraftLayer/context/LiveAircraftContext";
import AircraftThumb from "../AircraftLayer/components/AircraftThumb";
import { formatHeading } from "../AircraftLayer/utils/aircraftMovement";
import type { Aircraft } from "../AircraftLayer/types/Aircraft";
import type { Airport } from "../AirportLayer/types/Airport";
import type { Antenna } from "../AntennaLayer/types/Antenna";
import { useMapLayers } from "../../context/MapLayersContext";
import { usePopupScreenPosition } from "../AircraftLayer/hooks/usePopupScreenPosition";
import { POPUP_WIDTH } from "../AircraftLayer/utils/getPopupScreenPosition";

const popupMuted = "rgba(255,255,255,0.55)";
const popupText = "rgba(255,255,255,0.92)";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="caption" sx={{ color: popupMuted }}>
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={600} sx={{ color: popupText }}>
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
  const { addTrack, removeTrack, hasTrack } = useAircraft();
  const trackExists = hasTrack(aircraft.id);

  return (
    <>
      <Box sx={{ position: "relative", height: 90 }}>
        <AircraftThumb aircraftType={aircraft.aircraftType} iconSize={110} />
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
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Terrain sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" sx={{ color: popupMuted }}>Alt</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: popupText }}>
              {aircraft?.altitude_ft != null ? `${aircraft.altitude_ft.toLocaleString()} ft` : "—"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Speed sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" sx={{ color: popupMuted }}>Speed</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: popupText }}>
              {aircraft?.speed_kts != null ? `${aircraft.speed_kts} kts` : "—"}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 0.75, borderRadius: 1.5, bgcolor: "rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Route sx={{ color: "primary.main", fontSize: 14 }} />
            <Typography variant="caption" display="block" fontSize="0.6rem" sx={{ color: popupMuted }}>Hdg</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: popupText }}>
              {aircraft?.heading_deg != null ? `${formatHeading(aircraft.heading_deg)}°` : "—"}
            </Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 0.75 }} />
        <InfoRow label="Flight ID" value={aircraft.id} />
        <InfoRow label="Origin" value={aircraft.origin_city || "—"} />
        <InfoRow label="Destination" value={aircraft.destination_city || "—"} />
        <InfoRow
          label="Position"
          value={
            aircraft?.lat != null && aircraft?.lon != null
              ? `${aircraft.lat.toFixed(3)}°, ${aircraft.lon.toFixed(3)}°`
              : "—"
          }
        />
        <Button
          fullWidth
          size="small"
          variant={trackExists ? "outlined" : "contained"}
          color={trackExists ? "error" : "primary"}
          startIcon={trackExists ? <Delete /> : <Route />}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (trackExists) {
              removeTrack(aircraft.id);
            } else {
              addTrack(aircraft.id);
            }
          }}
          sx={{ mt: 1.25, py: 0.75, fontWeight: 600 }}
        >
          {trackExists ? "Delete Drawn Track" : "Draw Track"}
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
              <Typography color="text.secondary" variant="subtitle2" fontWeight={700}>
                {airport?.name || "Airport"}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {[airport?.city, airport?.country].filter(Boolean).join(", ")}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary" }}>
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25 }}>
        <InfoRow label="IATA" value={airport?.iata || "—"} />
        <InfoRow label="ICAO" value={airport?.icao || "—"} />
        <InfoRow
          label="Elevation"
          value={
            airport?.elevation_ft != null
              ? `${airport.elevation_ft.toLocaleString()} ft`
              : "—"
          }
        />
        <InfoRow label="Runways" value={airport?.runways ?? "—"} />
        <InfoRow
          label="Position"
          value={
            airport?.lat != null && airport?.lon != null
              ? `${airport.lat.toFixed(3)}°, ${airport.lon.toFixed(3)}°`
              : "—"
          }
        />
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
              <Typography color="text.secondary" variant="subtitle2" fontWeight={700}>
                {antenna?.name || "Antenna"}
              </Typography>
            </Stack>
            <Chip
              label={antenna?.type || "Antenna"}
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
        <InfoRow label="Frequency" value={antenna?.frequency || "—"} />
        <InfoRow
          label="Range"
          value={antenna?.range_km != null ? `${antenna.range_km} km` : "—"}
        />
        <InfoRow label="Operator" value={antenna?.operator || "—"} />
        <InfoRow label="Status" value={antenna?.status || "—"} />
        <InfoRow
          label="Position"
          value={
            antenna?.lat != null && antenna?.lon != null
              ? `${antenna.lat.toFixed(3)}°, ${antenna.lon.toFixed(3)}°`
              : "—"
          }
        />
      </Box>
    </>
  );
}

export default function MapItemPopup() {
  const { current: mapRef } = useMap();
  const { selectedEntity, selectEntity, getEntityData } = useMapLayers();
  const { getAircraftById } = useLiveAircraftEngine();
  const skipCloseRef = useRef(false);

  const [frozenAircraft, setFrozenAircraft] = useState<{
    id: string;
    anchor: { lon: number; lat: number };
    aircraft: Aircraft;
  } | null>(null);

  // Synchronously compute active entity and anchor based on selectedEntity
  const activeData = useMemo(() => {
    if (!selectedEntity) return null;

    if (selectedEntity.category === "airports") {
      const airport = getEntityData("airports", selectedEntity.id) as Airport | null;
      if (!airport || airport.lat == null || airport.lon == null) return null;
      return {
        category: "airports" as const,
        anchor: { lon: airport.lon, lat: airport.lat },
        airport,
      };
    }

    if (selectedEntity.category === "antennas") {
      const antenna = getEntityData("antennas", selectedEntity.id) as Antenna | null;
      if (!antenna || antenna.lat == null || antenna.lon == null) return null;
      return {
        category: "antennas" as const,
        anchor: { lon: antenna.lon, lat: antenna.lat },
        antenna,
      };
    }

    if (selectedEntity.category === "airplanes") {
      if (frozenAircraft && frozenAircraft.id === selectedEntity.id) {
        return {
          category: "airplanes" as const,
          anchor: frozenAircraft.anchor,
          aircraft: frozenAircraft.aircraft,
        };
      }
      const live = getAircraftById(selectedEntity.id);
      const fallback = getEntityData("airplanes", selectedEntity.id) as Aircraft | null;
      const aircraft = live ?? fallback;
      if (!aircraft || aircraft.lat == null || aircraft.lon == null) return null;
      return {
        category: "airplanes" as const,
        anchor: { lon: aircraft.lon, lat: aircraft.lat },
        aircraft,
      };
    }

    return null;
  }, [selectedEntity, getEntityData, getAircraftById, frozenAircraft]);

  // Keep frozen aircraft updated when an airplane is selected
  useEffect(() => {
    if (!selectedEntity || selectedEntity.category !== "airplanes") {
      if (frozenAircraft) setFrozenAircraft(null);
      return;
    }
    if (frozenAircraft?.id !== selectedEntity.id) {
      const live = getAircraftById(selectedEntity.id);
      const fallback = getEntityData("airplanes", selectedEntity.id) as Aircraft | null;
      const aircraft = live ?? fallback;
      if (aircraft && aircraft.lat != null && aircraft.lon != null) {
        setFrozenAircraft({
          id: selectedEntity.id,
          anchor: { lon: aircraft.lon, lat: aircraft.lat },
          aircraft: { ...aircraft },
        });
      }
    }
  }, [selectedEntity, frozenAircraft, getAircraftById, getEntityData]);

  const position = usePopupScreenPosition(activeData?.anchor ?? null);

  useEffect(() => {
    if (!selectedEntity) return;

    skipCloseRef.current = true;
    const timer = window.setTimeout(() => {
      skipCloseRef.current = false;
    }, 150);

    const map = mapRef?.getMap();
    if (!map || (map as { _removed?: boolean })._removed) {
      return () => window.clearTimeout(timer);
    }

    const handleMapClick = () => {
      if (skipCloseRef.current) return;
      selectEntity(selectedEntity.category, null);
    };

    map.on("click", handleMapClick);
    return () => {
      window.clearTimeout(timer);
      if (!(map as { _removed?: boolean })._removed) {
        map.off("click", handleMapClick);
      }
    };
  }, [selectedEntity, mapRef, selectEntity]);

  if (!selectedEntity || !activeData || !position) return null;

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
        {activeData.category === "airplanes" && (
          <AircraftPopupContent aircraft={activeData.aircraft} onClose={handleClose} />
        )}
        {activeData.category === "airports" && (
          <AirportPopupContent airport={activeData.airport} onClose={handleClose} />
        )}
        {activeData.category === "antennas" && (
          <AntennaPopupContent antenna={activeData.antenna} onClose={handleClose} />
        )}
      </Box>
    </Box>
  );
}
