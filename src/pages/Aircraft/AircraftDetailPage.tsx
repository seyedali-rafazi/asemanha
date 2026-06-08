import {
  AirplanemodeActive,
  ArrowBack,
  Explore,
  Flight,
  LocationOn,
  Route,
  Schedule,
  Speed,
  Terrain,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  Grow,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import aircraftData from "../Home/components/AircraftLayer/data/iran_aircraft_50.json";
import type { Aircraft } from "../Home/components/AircraftLayer/types/Aircraft";
import { getAircraftImage } from "../Home/components/AircraftLayer/utils/getAircraftImage";

const allAircraft = aircraftData as Aircraft[];

function InfoBlock({
  icon,
  label,
  value,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <Grow in timeout={500 + delay}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "#1d1f20",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "border-color 0.2s ease",
          "&:hover": { borderColor: "rgba(25,118,210,0.4)" },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
          {icon}
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Typography variant="h6" fontWeight={700}>
          {value}
        </Typography>
      </Box>
    </Grow>
  );
}

export default function AircraftDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const aircraft = useMemo(
    () => allAircraft.find((a) => a.id === id) ?? null,
    [id]
  );

  if (!aircraft) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Aircraft not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/airplane")}>
          Back to Fleet
        </Button>
      </Box>
    );
  }

  const lastUpdate = new Date(aircraft.lastUpdate).toLocaleString();
  const headingLabel = `${aircraft.heading_deg}°`;

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ position: "relative", height: { xs: 220, md: 300 }, overflow: "hidden" }}>
        <Box
          component="img"
          src={getAircraftImage(aircraft.aircraftType)}
          alt={aircraft.aircraftType}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            animation: "heroZoom 8s ease-out forwards",
            "@keyframes heroZoom": {
              from: { transform: "scale(1.1)" },
              to: { transform: "scale(1)" },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #0f1113 0%, rgba(15,17,19,0.6) 50%, rgba(15,17,19,0.3) 100%)",
          }}
        />
        <IconButton
          onClick={() => navigate("/airplane")}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <ArrowBack />
        </IconButton>
        <Fade in timeout={600}>
          <Box sx={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <AirplanemodeActive sx={{ color: "primary.main" }} />
              <Typography variant="h4" fontWeight={800} color="#fff">
                {aircraft.callsign}
              </Typography>
              <Chip
                label={aircraft.aircraftType}
                size="small"
                sx={{ bgcolor: "primary.main", color: "#fff", fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="body1" color="rgba(255,255,255,0.75)">
              {aircraft.airline} · {aircraft.id}
            </Typography>
          </Box>
        </Fade>
      </Box>

      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Fade in timeout={700}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
            mb={3}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
                flex: 1,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Flight sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="overline" color="text.secondary">
                  Route
                </Typography>
              </Stack>
              <Typography variant="h6" fontWeight={700}>
                {aircraft.origin_city} → {aircraft.destination_city}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Explore />}
              onClick={() => navigate(`/?select=${aircraft.id}`)}
              sx={{ py: 1.25, px: 3, fontWeight: 600, flexShrink: 0 }}
            >
              View on Map
            </Button>
          </Stack>
        </Fade>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Flight Telemetry
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <InfoBlock
            icon={<Terrain sx={{ fontSize: 18, color: "primary.main" }} />}
            label="Altitude"
            value={`${aircraft.altitude_ft.toLocaleString()} ft`}
            delay={0}
          />
          <InfoBlock
            icon={<Speed sx={{ fontSize: 18, color: "primary.main" }} />}
            label="Ground Speed"
            value={`${aircraft.speed_kts} kts`}
            delay={80}
          />
          <InfoBlock
            icon={<Route sx={{ fontSize: 18, color: "primary.main" }} />}
            label="Heading"
            value={headingLabel}
            delay={160}
          />
          <InfoBlock
            icon={<Schedule sx={{ fontSize: 18, color: "primary.main" }} />}
            label="Last Update"
            value={lastUpdate}
            delay={240}
          />
        </Box>

        <Fade in timeout={900}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#1d1f20",
              border: "1px solid rgba(255,255,255,0.08)",
              mb: 3,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <LocationOn sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Current Position
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Latitude: {aircraft.lat.toFixed(4)}° · Longitude: {aircraft.lon.toFixed(4)}°
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Flight Path Waypoints ({aircraft.path.length})
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {aircraft.path.map((point, i) => (
                <Grow in key={i} timeout={400 + i * 50}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "grey.A100",
                    }}
                  >
                    <Chip
                      label={i + 1}
                      size="small"
                      sx={{
                        width: 28,
                        height: 24,
                        fontSize: "0.7rem",
                        bgcolor: "primary.main",
                        color: "#fff",
                      }}
                    />
                    <Typography variant="body2">
                      {point[0].toFixed(3)}°, {point[1].toFixed(3)}°
                    </Typography>
                  </Box>
                </Grow>
              ))}
            </Stack>
          </Box>
        </Fade>

        <Fade in timeout={1000}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#1d1f20",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Aircraft Details
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {[
                ["Flight ID", aircraft.id],
                ["Callsign", aircraft.callsign],
                ["Airline", aircraft.airline],
                ["Aircraft Type", aircraft.aircraftType],
                ["Origin", aircraft.origin_city],
                ["Destination", aircraft.destination_city],
              ].map(([label, value], i) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom:
                      i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
