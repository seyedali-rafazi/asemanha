import {
  AirplanemodeActive,
  CellTower,
  Flight,
  Search,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import type { Aircraft } from "../AircraftLayer/types/Aircraft";
import type { Airport } from "../AirportLayer/types/Airport";
import type { Antenna } from "../AntennaLayer/types/Antenna";
import {
  useMapLayers,
  type LayerCategory,
} from "../../context/MapLayersContext";

const CATEGORY_CONFIG: Record<
  LayerCategory,
  { label: string; icon: ReactNode; color: string }
> = {
  airplanes: { label: "Airplanes", icon: <AirplanemodeActive fontSize="small" />, color: "#f2fa0a" },
  airports: { label: "Airports", icon: <Flight fontSize="small" />, color: "#60a5fa" },
  antennas: { label: "Antennas", icon: <CellTower fontSize="small" />, color: "#a78bfa" },
};

function getItemLabel(category: LayerCategory, item: Aircraft | Airport | Antenna) {
  if (category === "airplanes") {
    const a = item as Aircraft;
    return { primary: a.callsign, secondary: `${a.airline} · ${a.aircraftType}` };
  }
  if (category === "airports") {
    const a = item as Airport;
    return { primary: a.name, secondary: `${a.iata} / ${a.icao} · ${a.city}` };
  }
  const a = item as Antenna;
  return { primary: a.name, secondary: `${a.type} · ${a.status}` };
}

function matchesSearch(
  category: LayerCategory,
  item: Aircraft | Airport | Antenna,
  query: string
) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const { primary, secondary } = getItemLabel(category, item);
  return (
    primary.toLowerCase().includes(q) ||
    secondary.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  );
}

export default function LayersPanel() {
  const {
    activeCategory,
    setActiveCategory,
    categoryEnabled,
    toggleCategory,
    isItemVisible,
    toggleItemVisibility,
    setCategoryItemsVisibility,
    searchQuery,
    setSearchQuery,
    selectedEntity,
    selectEntity,
    airplanes,
    airports,
    antennas,
    getEntityData,
  } = useMapLayers();

  const items = useMemo(() => {
    const data =
      activeCategory === "airplanes"
        ? airplanes
        : activeCategory === "airports"
          ? airports
          : antennas;
    return data.filter((item) =>
      matchesSearch(activeCategory, item, searchQuery[activeCategory])
    );
  }, [activeCategory, airplanes, airports, antennas, searchQuery]);

  const visibleCount = items.filter((item) =>
    isItemVisible(activeCategory, item.id)
  ).length;

  const selectedData = selectedEntity
    ? getEntityData(selectedEntity.category, selectedEntity.id)
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ToggleButtonGroup
        value={activeCategory}
        exclusive
        fullWidth
        size="small"
        onChange={(_, value: LayerCategory | null) => {
          if (value) setActiveCategory(value);
        }}
        sx={{ mb: 2 }}
      >
        {(Object.keys(CATEGORY_CONFIG) as LayerCategory[]).map((cat) => (
          <ToggleButton key={cat} value={cat} sx={{ py: 0.75, fontSize: "0.7rem" }}>
            <Stack alignItems="center" spacing={0.25}>
              {CATEGORY_CONFIG[cat].icon}
              <span>{CATEGORY_CONFIG[cat].label}</span>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            size="small"
            checked={categoryEnabled[activeCategory]}
            onChange={() => toggleCategory(activeCategory)}
          />
          <Typography variant="caption" color="text.secondary">
            Show {CATEGORY_CONFIG[activeCategory].label}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {visibleCount}/{items.length}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
        <IconButton
          size="small"
          title="Show all"
          onClick={() => setCategoryItemsVisibility(activeCategory, true)}
          sx={{ bgcolor: "grey.A100" }}
        >
          <Visibility fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          title="Hide all"
          onClick={() => setCategoryItemsVisibility(activeCategory, false)}
          sx={{ bgcolor: "grey.A100" }}
        >
          <VisibilityOff fontSize="small" />
        </IconButton>
      </Stack>

      <TextField
        size="small"
        placeholder={`Search ${CATEGORY_CONFIG[activeCategory].label.toLowerCase()}...`}
        value={searchQuery[activeCategory]}
        onChange={(e) => setSearchQuery(activeCategory, e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
      />

      <List
        disablePadding
        sx={{ flex: 1, overflow: "auto", mx: -0.5, mb: selectedData ? 1 : 0 }}
      >
        {items.map((item) => {
          const { primary, secondary } = getItemLabel(activeCategory, item);
          const visible = isItemVisible(activeCategory, item.id);
          const isSelected =
            selectedEntity?.category === activeCategory &&
            selectedEntity?.id === item.id;

          return (
            <ListItemButton
              key={item.id}
              selected={isSelected}
              onClick={() => selectEntity(activeCategory, item.id)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                opacity: visible ? 1 : 0.45,
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "transparent",
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {primary}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {secondary}
                  </Typography>
                }
                sx={{ pr: 1 }}
              />
              <IconButton
                size="small"
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItemVisibility(activeCategory, item.id);
                }}
                sx={{ color: visible ? "primary.main" : "text.secondary" }}
              >
                {visible ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>
            </ListItemButton>
          );
        })}
      </List>

      {selectedData && selectedEntity && (
        <>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "grey.A100",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
              {CATEGORY_CONFIG[selectedEntity.category].icon}
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                SELECTED
              </Typography>
              <Chip
                label={selectedEntity.id}
                size="small"
                sx={{ height: 18, fontSize: "0.6rem", ml: "auto" }}
              />
            </Stack>
            {selectedEntity.category === "airplanes" && (
              <>
                <Typography variant="body2" fontWeight={700}>
                  {(selectedData as Aircraft).callsign}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {(selectedData as Aircraft).airline}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {(selectedData as Aircraft).origin_city} → {(selectedData as Aircraft).destination_city}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Alt: {(selectedData as Aircraft).altitude_ft.toLocaleString()} ft · {(selectedData as Aircraft).speed_kts} kts
                </Typography>
              </>
            )}
            {selectedEntity.category === "airports" && (
              <>
                <Typography variant="body2" fontWeight={700}>
                  {(selectedData as Airport).name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {(selectedData as Airport).iata} / {(selectedData as Airport).icao}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {(selectedData as Airport).city} · {(selectedData as Airport).runways} runways
                </Typography>
              </>
            )}
            {selectedEntity.category === "antennas" && (
              <>
                <Typography variant="body2" fontWeight={700}>
                  {(selectedData as Antenna).name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {(selectedData as Antenna).type} · {(selectedData as Antenna).frequency}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Range: {(selectedData as Antenna).range_km} km · {(selectedData as Antenna).status}
                </Typography>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
