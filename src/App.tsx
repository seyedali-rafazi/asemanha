import {
  AirplanemodeActive,
  HomeOutlined,
  Layers,
  Route as RouteIcon,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { SidebarProvider } from "./components/utils/Sidebar/SidebarProvider";
import TracksPanel from "./pages/Home/components/AircraftLayer/components/TracksPanel/TracksPanel";
import { AircraftProvider } from "./pages/Home/components/AircraftLayer/context/AircraftContext";
import LayersPanel from "./pages/Home/components/LayersPanel/LayersPanel";
import { MapLayersProvider } from "./pages/Home/context/MapLayersContext";
import HomePage from "./pages/Home/Home";
import ShopPage from "./pages/Shop/Shop";

// ✅ Custom MUI Theme
const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f1113",
      paper: "#1d1f20",
    },
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
    },
    divider: "rgba(255, 255, 255, 0.08)",
    text: {
      primary: "rgba(255, 255, 255, 0.92)",
      secondary: "rgba(255, 255, 255, 0.55)",
    },
    grey: { A100: "#2a2d30" },
  },
  shape: {
    borderRadius: 10,
  },
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
});

const SettingComponent = () => (
  <Box>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Manage your account and preferences.
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Profile, Theme, and Language...
    </Typography>
  </Box>
);

// --- The Sidebar Configuration ---
const sidebarConfig = [
  {
    id: "home",
    textButton: "Home",
    position: "top",
    navigate: "/",
    icon: <HomeOutlined />,
  },
  {
    id: "airplane",
    textButton: "Airplane",
    position: "top",
    navigate: "/airplane",
    icon: <AirplanemodeActive />,
  },
  {
    id: "layers",
    textButton: "Layers",
    position: "top",
    component: <LayersPanel />,
    icon: <Layers />,
  },
  {
    id: "tracks",
    textButton: "Tracks",
    position: "top",
    component: <TracksPanel />,
    icon: <RouteIcon />,
  },
  {
    id: "setting",
    textButton: "Setting",
    component: <SettingComponent />,
    position: "bottom",
    icon: <Settings />,
  },
];

// --- Main App Root ---
export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AircraftProvider>
          <MapLayersProvider>
            <SidebarProvider config={sidebarConfig}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/airplane" element={<ShopPage />} />
              </Routes>
            </SidebarProvider>
          </MapLayersProvider>
        </AircraftProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
