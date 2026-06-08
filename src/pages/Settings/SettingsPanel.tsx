import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapIcon from "@mui/icons-material/Map";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControlLabel,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MAP_STYLE_OPTIONS, type MapStyleId } from "../../store/mapStyles";
import {
  setAirplaneSize,
  setMapStyleId,
  setShowAirplaneAltitude,
} from "../../store/settingsSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

export default function SettingsPanel() {
  const dispatch = useAppDispatch();
  const { mapStyleId, airplaneSize, showAirplaneAltitude } = useAppSelector(
    (state) => state.settings
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Manage map appearance and aircraft display options.
      </Typography>

      <Accordion
        disableGutters
        elevation={0}
        sx={{
          bgcolor: "transparent",
          "&:before": { display: "none" },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "10px !important",
          overflow: "hidden",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <MapIcon fontSize="small" sx={{ mr: 1.5, color: "primary.light" }} />
          <Typography variant="subtitle2">Map Style</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
            Choose the base map tile style.
          </Typography>
          <ToggleButtonGroup
            value={mapStyleId}
            exclusive
            fullWidth
            size="small"
            onChange={(_, value: MapStyleId | null) => {
              if (value) dispatch(setMapStyleId(value));
            }}
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {MAP_STYLE_OPTIONS.map((style) => (
              <ToggleButton
                key={style.id}
                value={style.id}
                sx={{ flex: "1 1 45%", textTransform: "none", fontSize: "0.75rem" }}
              >
                {style.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </AccordionDetails>
      </Accordion>

      <Accordion
        disableGutters
        elevation={0}
        sx={{
          bgcolor: "transparent",
          "&:before": { display: "none" },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "10px !important",
          overflow: "hidden",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <AirplanemodeActiveIcon
            fontSize="small"
            sx={{ mr: 1.5, color: "primary.light" }}
          />
          <Typography variant="subtitle2">Airplane Settings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Icon size: {airplaneSize}px
            </Typography>
            <Slider
              value={airplaneSize}
              onChange={(_, value) =>
                dispatch(setAirplaneSize(value as number))
              }
              min={16}
              max={64}
              step={2}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={showAirplaneAltitude}
                onChange={(e) =>
                  dispatch(setShowAirplaneAltitude(e.target.checked))
                }
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                {showAirplaneAltitude
                  ? "Show altitude labels"
                  : "Hide altitude labels"}
              </Typography>
            }
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
