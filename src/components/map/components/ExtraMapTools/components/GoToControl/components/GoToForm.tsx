import { useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

// Zero-dependency WGS84 UTM to Lat/Lon converter
const utmToLatLon = (easting, northing, zoneNum, isNorth) => {
  const a = 6378137.0; // WGS84 semi-major axis
  const eccSquared = 0.00669438; // WGS84 eccentricity squared
  const k0 = 0.9996;

  const x = easting - 500000.0;
  const y = isNorth ? northing : northing - 10000000.0;
  const longOrigin = (zoneNum - 1) * 6 - 180 + 3;

  const eccPrimeSquared = eccSquared / (1 - eccSquared);
  const M = y / k0;
  const mu =
    M /
    (a *
      (1 -
        eccSquared / 4 -
        (3 * eccSquared * eccSquared) / 64 -
        (5 * Math.pow(eccSquared, 3)) / 256));

  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));

  const phi1Rad =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu);

  const N1 =
    a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const R1 =
    (a * (1 - eccSquared)) /
    Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const D = x / (N1 * k0);

  const lat =
    phi1Rad -
    ((N1 * Math.tan(phi1Rad)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) *
          Math.pow(D, 4)) /
          24 +
        ((61 +
          90 * T1 +
          298 * C1 +
          45 * T1 * T1 -
          252 * eccPrimeSquared -
          3 * C1 * C1) *
          Math.pow(D, 6)) /
          720);

  const lon =
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 -
        2 * C1 +
        28 * T1 -
        3 * C1 * C1 +
        8 * eccPrimeSquared +
        24 * T1 * T1) *
        Math.pow(D, 5)) /
        120) /
    Math.cos(phi1Rad);

  return {
    lat: lat * (180.0 / Math.PI),
    lon: longOrigin + lon * (180.0 / Math.PI),
  };
};

const GoToForm = ({ onClose }) => {
  const { current: currentMap } = useMap();
  const map = currentMap?.getMap();

  const [isUtm, setIsUtm] = useState(false);

  // Lat / Lon State
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  // UTM State
  const [easting, setEasting] = useState("");
  const [northing, setNorthing] = useState("");
  const [zone, setZone] = useState("");
  const [hemisphere, setHemisphere] = useState("N");

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    let finalLat, finalLon;

    try {
      if (isUtm) {
        const eVal = parseFloat(easting);
        const nVal = parseFloat(northing);
        const zVal = parseInt(zone, 10);
        const isNorth = hemisphere === "N";

        if (
          isNaN(eVal) ||
          isNaN(nVal) ||
          isNaN(zVal) ||
          zVal < 1 ||
          zVal > 60
        ) {
          throw new Error("Invalid UTM coordinates or Zone (1-60).");
        }

        const converted = utmToLatLon(eVal, nVal, zVal, isNorth);
        finalLat = converted.lat;
        finalLon = converted.lon;
      } else {
        finalLat = parseFloat(lat);
        finalLon = parseFloat(lon);

        if (
          isNaN(finalLat) ||
          isNaN(finalLon) ||
          finalLat < -90 ||
          finalLat > 90 ||
          finalLon < -180 ||
          finalLon > 180
        ) {
          throw new Error(
            "Invalid Latitude (-90 to 90) or Longitude (-180 to 180)."
          );
        }
      }

      if (map) {
        map.flyTo({
          center: [finalLon, finalLat],
          zoom: 14,
          essential: true,
        });
        onClose(); // Close the popover automatically after flying
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        padding: "12px !important",
        width: 280,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" color="text.primary">
          Go to Location
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isUtm}
              onChange={(e) => setIsUtm(e.target.checked)}
              size="small"
              color="primary"
            />
          }
          label={
            <Typography variant="caption">
              {isUtm ? "UTM" : "Lat/Lon"}
            </Typography>
          }
          labelPlacement="start"
          sx={{ m: 0 }}
        />
      </Box>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {!isUtm ? (
          <>
            <TextField
              label="Latitude (Y)"
              size="small"
              fullWidth
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 35.6892"
            />
            <TextField
              label="Longitude (X)"
              size="small"
              fullWidth
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="e.g. 51.3890"
            />
          </>
        ) : (
          <>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Easting (X)"
                size="small"
                fullWidth
                value={easting}
                onChange={(e) => setEasting(e.target.value)}
              />
              <TextField
                label="Northing (Y)"
                size="small"
                fullWidth
                value={northing}
                onChange={(e) => setNorthing(e.target.value)}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="Zone"
                size="small"
                type="number"
                sx={{ width: "60%" }}
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. 39"
              />
              <FormControl size="small" sx={{ width: "40%" }}>
                <InputLabel>Hem.</InputLabel>
                <Select
                  label="Hem."
                  value={hemisphere}
                  onChange={(e) => setHemisphere(e.target.value)}
                >
                  <MenuItem value="N">North</MenuItem>
                  <MenuItem value="S">South</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}

        {error && (
          <Typography color="error" variant="caption" sx={{ lineHeight: 1.2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="small"
          sx={{ mt: 1 }}
        >
          Fly To Destination
        </Button>
      </form>
    </Box>
  );
};

export default GoToForm;
