import { AirplanemodeActive, FlightTakeoff } from "@mui/icons-material";
import { Box, Fade, Grid, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import aircraftData from "../Home/components/AircraftLayer/data/iran_aircraft_50.json";
import type { Aircraft } from "../Home/components/AircraftLayer/types/Aircraft";
import AircraftCard from "./components/AircraftCard";
import AircraftFiltersBar from "./components/AircraftFiltersBar";
import {
  DEFAULT_FILTERS,
  filterAircraft,
  getUniqueAirlines,
  getUniqueTypes,
  sortAircraft,
  type AircraftFilters,
  type SortDirection,
  type SortField,
} from "./utils/aircraftFilters";

const allAircraft = aircraftData as Aircraft[];

export default function AircraftListPage() {
  const [filters, setFilters] = useState<AircraftFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("callsign");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const airlines = useMemo(() => getUniqueAirlines(allAircraft), []);
  const aircraftTypes = useMemo(() => getUniqueTypes(allAircraft), []);

  const displayedAircraft = useMemo(() => {
    const filtered = filterAircraft(allAircraft, filters);
    return sortAircraft(filtered, sortField, sortDirection);
  }, [filters, sortField, sortDirection]);

  const activeCount = displayedAircraft.length;

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(ellipse at 20% 0%, rgba(25,118,210,0.08) 0%, transparent 50%)",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Fade in timeout={500}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "rgba(25,118,210,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AirplanemodeActive sx={{ color: "primary.main", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Fleet Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse, filter, and explore live aircraft data
              </Typography>
            </Box>
          </Stack>
        </Fade>

        <Fade in timeout={600}>
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 2 }}>
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FlightTakeoff sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary">
                  Total Aircraft
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                {allAircraft.length}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Filtered Results
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                {activeCount}
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
                display: { xs: "none", sm: "block" },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Airlines
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                {airlines.length}
              </Typography>
            </Box>
          </Stack>
        </Fade>

        <Fade in timeout={700}>
          <Box>
            <AircraftFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              sortField={sortField}
              sortDirection={sortDirection}
              onSortFieldChange={setSortField}
              onSortDirectionChange={setSortDirection}
              airlines={airlines}
              aircraftTypes={aircraftTypes}
              resultCount={activeCount}
              totalCount={allAircraft.length}
            />
          </Box>
        </Fade>

        {displayedAircraft.length === 0 ? (
          <Fade in>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                borderRadius: 2,
                border: "1px dashed rgba(255,255,255,0.12)",
              }}
            >
              <AirplanemodeActive
                sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.4 }}
              />
              <Typography variant="h6" color="text.secondary">
                No aircraft match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Try adjusting search or filter criteria
              </Typography>
            </Box>
          </Fade>
        ) : (
          <Grid container spacing={2.5}>
            {displayedAircraft.map((aircraft, index) => (
              <Grid key={aircraft.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <AircraftCard aircraft={aircraft} index={index} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
