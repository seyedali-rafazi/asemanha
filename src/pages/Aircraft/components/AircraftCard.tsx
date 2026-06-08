import {
  AirplanemodeActive,
  ArrowForward,
  Route,
  Speed,
  Terrain,
} from "@mui/icons-material";
import { Box, Chip, Grow, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Aircraft } from "../../Home/components/AircraftLayer/types/Aircraft";
import { getAircraftImage } from "../../Home/components/AircraftLayer/utils/getAircraftImage";

interface AircraftCardProps {
  aircraft: Aircraft;
  index: number;
}

export default function AircraftCard({ aircraft, index }: AircraftCardProps) {
  const navigate = useNavigate();

  return (
    <Grow in timeout={400 + index * 60}>
      <Box
        onClick={() => navigate(`/airplane/${aircraft.id}`)}
        sx={{
          cursor: "pointer",
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "#1d1f20",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
            borderColor: "primary.main",
            "& .card-arrow": { opacity: 1, transform: "translateX(0)" },
            "& .card-image": { transform: "scale(1.06)" },
          },
        }}
      >
        <Box sx={{ position: "relative", height: 140, overflow: "hidden" }}>
          <Box
            className="card-image"
            component="img"
            src={getAircraftImage(aircraft.aircraftType)}
            alt={aircraft.aircraftType}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,17,19,0.95) 0%, rgba(15,17,19,0.2) 60%)",
            }}
          />
          <Chip
            label={aircraft.aircraftType}
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              height: 22,
              fontSize: "0.65rem",
              bgcolor: "rgba(0,0,0,0.55)",
              color: "#fff",
            }}
          />
          <Box
            className="card-arrow"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              opacity: 0,
              transform: "translateX(-8px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
              bgcolor: "primary.main",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowForward sx={{ fontSize: 16, color: "#fff" }} />
          </Box>
        </Box>

        <Box sx={{ p: 1.75 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} mb={0.5}>
            <AirplanemodeActive sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="subtitle2" fontWeight={700}>
              {aircraft.callsign}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              · {aircraft.id}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            {aircraft.airline}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={0.5} mb={1.25}>
            <Route sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" fontWeight={500}>
              {aircraft.origin_city} → {aircraft.destination_city}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75}>
            <Chip
              icon={<Terrain sx={{ fontSize: "14px !important" }} />}
              label={`${aircraft.altitude_ft.toLocaleString()} ft`}
              size="small"
              sx={{ height: 24, fontSize: "0.7rem", bgcolor: "grey.A100" }}
            />
            <Chip
              icon={<Speed sx={{ fontSize: "14px !important" }} />}
              label={`${aircraft.speed_kts} kts`}
              size="small"
              sx={{ height: 24, fontSize: "0.7rem", bgcolor: "grey.A100" }}
            />
          </Stack>
        </Box>
      </Box>
    </Grow>
  );
}
