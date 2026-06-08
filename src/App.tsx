import {
  AirplanemodeActive,
  HomeOutlined,
  Layers,
  Route as RouteIcon,
  Settings,
} from "@mui/icons-material";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "./store";
import SettingsPanel from "./pages/Settings/SettingsPanel";
import { SidebarProvider } from "./components/utils/Sidebar/SidebarProvider";
import TracksPanel from "./pages/Home/components/AircraftLayer/components/TracksPanel/TracksPanel";
import { AircraftProvider } from "./pages/Home/components/AircraftLayer/context/AircraftContext";
import LayersPanel from "./pages/Home/components/LayersPanel/LayersPanel";
import { MapLayersProvider } from "./pages/Home/context/MapLayersContext";
import AircraftDetailPage from "./pages/Aircraft/AircraftDetailPage";
import AircraftListPage from "./pages/Aircraft/AircraftListPage";
import HomePage from "./pages/Home/Home";

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
    component: <SettingsPanel />,
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
        <Provider store={store}>
          <AircraftProvider>
            <MapLayersProvider>
              <SidebarProvider config={sidebarConfig}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/airplane" element={<AircraftListPage />} />
                  <Route path="/airplane/:id" element={<AircraftDetailPage />} />
                </Routes>
              </SidebarProvider>
            </MapLayersProvider>
          </AircraftProvider>
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
