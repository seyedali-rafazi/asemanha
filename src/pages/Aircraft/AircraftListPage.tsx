import {
  AirplanemodeActive,
  FlightLand,
  FlightTakeoff,
  Refresh,
  Speed,
  Terrain,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { useAircraftListQuery, useFleetStatsQuery } from "../../hooks/useAircraftQueries";
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

function AircraftListPage() {
  const [filters, setFilters] = useState<AircraftFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>("callsign");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const scrollRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const columns = isLg ? 4 : isMd ? 3 : isSm ? 2 : 1;

  // React Query for live aircraft and fleet statistics
  const {
    data: aircraftResponse,
    isLoading: aircraftLoading,
    isFetching: aircraftFetching,
    refetch: refetchAircraft,
  } = useAircraftListQuery();

  const {
    data: stats,
    refetch: refetchStats,
  } = useFleetStatsQuery();

  const allAircraft = useMemo(() => {
    return aircraftResponse?.aircraft || [];
  }, [aircraftResponse]);

  const isCached = aircraftResponse?.cached ?? false;
  const lastSync = aircraftResponse?.time ? new Date(aircraftResponse.time * 1000) : null;
  const loading = aircraftLoading || aircraftFetching;

  const handleRefresh = useCallback(() => {
    refetchAircraft();
    refetchStats();
  }, [refetchAircraft, refetchStats]);

  const airlines = useMemo(() => getUniqueAirlines(allAircraft), [allAircraft]);
  const aircraftTypes = useMemo(() => getUniqueTypes(allAircraft), [allAircraft]);

  const displayedAircraft = useMemo(() => {
    const filtered = filterAircraft(allAircraft, filters);
    return sortAircraft(filtered, sortField, sortDirection);
  }, [allAircraft, filters, sortField, sortDirection]);

  const activeCount = displayedAircraft.length;
  const rowCount = Math.ceil(displayedAircraft.length / columns);

  // TanStack Virtualizer for the responsive grid rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 240,
    overscan: 3,
  });

  return (
    <Box
      ref={scrollRef}
      sx={{
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(ellipse at 20% 0%, rgba(25,118,210,0.08) 0%, transparent 50%)",
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
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
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: "rgba(255,255,255,0.92)" }}
                >
                  Fleet Overview
                </Typography>
                <Chip
                  label={isCached ? "AirLabs Cache" : "Live AirLabs ADS-B"}
                  size="small"
                  sx={{
                    bgcolor: isCached
                      ? "rgba(234,179,8,0.15)"
                      : "rgba(34,197,94,0.15)",
                    color: isCached ? "#facc15" : "#4ade80",
                    border: `1px solid ${
                      isCached
                        ? "rgba(234,179,8,0.3)"
                        : "rgba(34,197,94,0.3)"
                    }`,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {lastSync
                  ? `Last updated at ${lastSync.toLocaleTimeString()}`
                  : "Live ADS-B real-time flight telemetry"}
              </Typography>
            </Box>
          </Stack>

          <Tooltip title="Refresh live telemetry from backend">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  bgcolor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(25,118,210,0.2)" },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "primary.main" }} />
                ) : (
                  <Refresh fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Fleet Metrics Row */}
        <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FlightTakeoff sx={{ color: "primary.main", fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Total Fleet
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5, color: "rgba(255,255,255,0.92)" }}
              >
                {stats?.total_aircraft ?? allAircraft.length}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FlightTakeoff sx={{ color: "#4ade80", fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Airborne
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5, color: "#4ade80" }}
              >
                {stats?.airborne ??
                  allAircraft.filter((a) => a.altitude_ft > 500).length}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <FlightLand sx={{ color: "#facc15", fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  On Ground
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5, color: "rgba(255,255,255,0.92)" }}
              >
                {stats?.on_ground ??
                  allAircraft.filter((a) => a.altitude_ft <= 500).length}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Terrain sx={{ color: "primary.light", fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Avg Altitude
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5, color: "rgba(255,255,255,0.92)" }}
              >
                {stats?.avg_altitude_ft
                  ? `${stats.avg_altitude_ft.toLocaleString()} ft`
                  : "0 ft"}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#1d1f20",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Speed sx={{ color: "primary.light", fontSize: 18 }} />
                <Typography variant="caption" color="text.secondary">
                  Avg Speed
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5, color: "rgba(255,255,255,0.92)" }}
              >
                {stats?.avg_speed_kts
                  ? `${stats.avg_speed_kts} kts`
                  : "0 kts"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

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

        {loading && allAircraft.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : displayedAircraft.length === 0 ? (
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
              No live aircraft match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Try adjusting search or filter criteria
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              minHeight: 300,
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * columns;
                const rowAircraft = displayedAircraft.slice(
                  startIndex,
                  startIndex + columns
                );

                return (
                  <div
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                      paddingBottom: 20,
                    }}
                  >
                    <Grid container spacing={2.5}>
                      {rowAircraft.map((aircraft) => (
                        <Grid key={aircraft.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <AircraftCard aircraft={aircraft} />
                        </Grid>
                      ))}
                    </Grid>
                  </div>
                );
              })}
            </div>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(AircraftListPage);
