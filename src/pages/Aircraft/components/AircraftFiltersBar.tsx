import { FilterList, Search } from "@mui/icons-material";
import {
  Box,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import type {
  AircraftFilters,
  SortDirection,
  SortField,
} from "../utils/aircraftFilters";

interface AircraftFiltersBarProps {
  filters: AircraftFilters;
  onFiltersChange: (filters: AircraftFilters) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  airlines: string[];
  aircraftTypes: string[];
  resultCount: number;
  totalCount: number;
}

const filterIconButtonSx = (active: boolean) => ({
  width: 42,
  height: 42,
  flexShrink: 0,
  alignSelf: "center",
  borderRadius: 2,
  border: "1px solid",
  borderColor: active ? "primary.main" : "rgba(255,255,255,0.12)",
  bgcolor: active ? "primary.main" : "rgba(255,255,255,0.06)",
  color: active ? "#fff" : "text.secondary",
  transition: "all 0.2s ease",
  "&:hover": {
    bgcolor: active ? "primary.dark" : "rgba(255,255,255,0.1)",
    borderColor: active ? "primary.dark" : "rgba(255,255,255,0.2)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 22,
  },
});

export default function AircraftFiltersBar({
  filters,
  onFiltersChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
  airlines,
  aircraftTypes,
  resultCount,
  totalCount,
}: AircraftFiltersBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const update = (patch: Partial<AircraftFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const altitudeSlider = (
    <Box>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Altitude range (ft)
      </Typography>
      <Slider
        value={[filters.minAltitude, filters.maxAltitude]}
        onChange={(_, value) => {
          const [min, max] = value as number[];
          update({ minAltitude: min, maxAltitude: max });
        }}
        min={0}
        max={45000}
        step={1000}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `${v.toLocaleString()} ft`}
        sx={{ mt: 1 }}
      />
    </Box>
  );

  const filterSelects = (
    <>
      <FormControl size="small" fullWidth={isMobile} sx={{ minWidth: isMobile ? undefined : 150 }}>
        <InputLabel>Airline</InputLabel>
        <Select
          label="Airline"
          value={filters.airline}
          onChange={(e) => update({ airline: e.target.value })}
        >
          <MenuItem value="all">All Airlines</MenuItem>
          {airlines.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={isMobile} sx={{ minWidth: isMobile ? undefined : 130 }}>
        <InputLabel>Type</InputLabel>
        <Select
          label="Type"
          value={filters.aircraftType}
          onChange={(e) => update({ aircraftType: e.target.value })}
        >
          <MenuItem value="all">All Types</MenuItem>
          {aircraftTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={isMobile} sx={{ minWidth: isMobile ? undefined : 140 }}>
        <InputLabel>Sort by</InputLabel>
        <Select
          label="Sort by"
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        >
          <MenuItem value="callsign">Callsign</MenuItem>
          <MenuItem value="airline">Airline</MenuItem>
          <MenuItem value="altitude">Altitude</MenuItem>
          <MenuItem value="speed">Speed</MenuItem>
          <MenuItem value="lastUpdate">Last Update</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth={isMobile} sx={{ minWidth: isMobile ? undefined : 110 }}>
        <InputLabel>Order</InputLabel>
        <Select
          label="Order"
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>
    </>
  );

  if (isMobile) {
    return (
      <Box
        sx={{
          bgcolor: "#1a1d1f",
          borderRadius: 2.5,
          border: "1px solid rgba(255,255,255,0.08)",
          p: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search aircraft..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            sx={{ flex: 1, minWidth: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title={mobileFiltersOpen ? "Hide filters" : "Show filters"}>
            <IconButton
              onClick={() => setMobileFiltersOpen((v) => !v)}
              aria-label="Toggle filters"
              sx={filterIconButtonSx(mobileFiltersOpen)}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
        </Stack>

        <Collapse in={mobileFiltersOpen}>
          <Stack
            spacing={1.5}
            sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {filterSelects}
            {altitudeSlider}
          </Stack>
        </Collapse>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          Showing {resultCount} of {totalCount} aircraft
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#1a1d1f",
        borderRadius: 2.5,
        border: "1px solid rgba(255,255,255,0.08)",
        p: 2,
        mb: 3,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Search callsign, airline, route..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        {filterSelects}

        <Tooltip title={showAdvanced ? "Hide altitude filter" : "Show altitude filter"}>
          <IconButton
            onClick={() => setShowAdvanced((v) => !v)}
            aria-label="Toggle altitude filter"
            sx={filterIconButtonSx(showAdvanced)}
          >
            <FilterList />
          </IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={showAdvanced}>
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {altitudeSlider}
        </Box>
      </Collapse>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
        Showing {resultCount} of {totalCount} aircraft
      </Typography>
    </Box>
  );
}
