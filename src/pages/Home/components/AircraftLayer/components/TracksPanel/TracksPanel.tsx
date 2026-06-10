import { Delete, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { BASE_AIRCRAFT } from "../../data/aircraftFleet";
import { useAircraft } from "../../context/AircraftContext";

export default function TracksPanel() {
  const { tracks, toggleTrackVisibility, removeTrack } = useAircraft();
  const data = BASE_AIRCRAFT;
  const listRef = useRef<HTMLUListElement>(null);
  const prevTrackCountRef = useRef(tracks.length);

  useEffect(() => {
    if (tracks.length > prevTrackCountRef.current && listRef.current) {
      const lastItem = listRef.current.lastElementChild;
      lastItem?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    prevTrackCountRef.current = tracks.length;
  }, [tracks.length]);

  const trackItems = useMemo(
    () =>
      tracks.map((track) => {
        const aircraft = data.find((a) => a.id === track.aircraftId);
        return { track, aircraft };
      }),
    [tracks, data]
  );

  if (tracks.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No tracks drawn yet.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Click an airplane and press Draw Track.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <List
        ref={listRef}
        disablePadding
        sx={{ flex: 1, overflow: "auto", mx: -0.5, minHeight: 0 }}
      >
      {trackItems.map(({ track, aircraft }) => (
        <ListItem
          key={track.aircraftId}
          disablePadding
          sx={{
            mb: 1,
            borderRadius: 2,
            bgcolor: "grey.A100",
            border: "1px solid",
            borderColor: track.visible ? "primary.main" : "divider",
            opacity: track.visible ? 1 : 0.6,
            transition: "all 0.2s ease",
          }}
          secondaryAction={
            <Box sx={{ display: "flex", gap: 0.25 }}>
              <IconButton
                edge="end"
                size="small"
                onClick={() => toggleTrackVisibility(track.aircraftId)}
                sx={{ color: track.visible ? "primary.main" : "text.secondary" }}
                title={track.visible ? "Hide track" : "Show track"}
              >
                {track.visible ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                onClick={() => removeTrack(track.aircraftId)}
                sx={{ color: "error.main" }}
                title="Remove track"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <ListItemText
            sx={{ px: 1.5, py: 1, pr: 7 }}
            primary={
              <Typography variant="body2" fontWeight={700}>
                {aircraft?.callsign ?? track.aircraftId}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {aircraft
                  ? `${aircraft.origin_city} → ${aircraft.destination_city}`
                  : "Unknown route"}
              </Typography>
            }
          />
        </ListItem>
      ))}
      </List>
    </Box>
  );
}
