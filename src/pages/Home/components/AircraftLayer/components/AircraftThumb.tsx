import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { getAircraftVisual } from "../utils/getAircraftVisual";
import {
  AIRCRAFT_ATLAS_URL,
  getAircraftIconMapping,
  resolveAircraftIconId,
} from "../utils/resolveAircraftIcon";

interface AircraftThumbProps {
  aircraftType: string;
  aircraftIcao?: string;
  category?: number;
  className?: string;
  iconSize?: number;
  sx?: SxProps<Theme>;
}

const mapping = getAircraftIconMapping();

export default function AircraftThumb({
  aircraftType,
  aircraftIcao,
  category,
  className,
  iconSize = 150,
  sx,
}: AircraftThumbProps) {
  const visual = getAircraftVisual(aircraftType);
  const iconId = resolveAircraftIconId({
    aircraftType,
    aircraft_icao: aircraftIcao,
    category,
  });
  const frame = mapping[iconId] ?? mapping.unknown ?? mapping.Unidentified;
  const displaySize = Math.max(48, Math.round(iconSize * 0.72));
  const scale = frame ? displaySize / frame.width : 1;

  return (
    <Box
      className={className}
      sx={{
        position: "absolute",
        inset: 0,
        background: visual.gradient,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 72% 22%, rgba(255,255,255,0.22), transparent 55%)",
        }}
      />
      {frame && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: 10,
            bottom: 8,
            width: displaySize,
            height: displaySize,
            filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
            opacity: 0.95,
            transform: "rotate(-28deg)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: frame.width,
              height: frame.height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              backgroundImage: `url(${AIRCRAFT_ATLAS_URL})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: `-${frame.x}px -${frame.y}px`,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
