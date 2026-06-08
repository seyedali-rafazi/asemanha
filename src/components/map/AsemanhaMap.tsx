// src/MapboxMap.jsx
import "mapbox-gl/dist/mapbox-gl.css";
import { Map, Source, Layer } from "react-map-gl/mapbox"; // ✅ Import Source and Layer
import CoordinateDisplay from "./components/CoordinateDisplay/CoordinateDisplay";
import MapControlBox from "./components/MapControlBox";
import MapNavigator from "./components/MapNavigator/MapNavigator";
import { useMediaQuery, useTheme } from "@mui/material";
import MapDrawTools from "./components/MapDrawTool/MapDrawTools";
import ExtraMapTools from "./components/ExtraMapTools/ExtraMapTools";
import MapView from "./components/MapView/MapView";
import MapResizeHandler from "./components/MapResizeHandler/MapResizeHandler";
import { useState, type FC, type ReactNode } from "react";
import type { MapTool } from "./types/MapTypes";



const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  import.meta.env.REACT_APP_MAPBOX_TOKEN;


const BaladUrl = `https://tiles.raah.ir/dynamic/new_style_preview.json`;

const ZOOM_BOX_POSITION = "top-left";
const COORDINATE_POSITION = "bottom-left";
const TOOLBAR_POSITION = "top-right";
const MAP_VIEW = "bottom-right";

interface MapboxMapProps {
  children?: ReactNode;
}

// ✅ Create a polygon that covers the entire world
const worldPolygon = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-180, 90],
            [180, 90],
            [180, -90],
            [-180, -90],
            [-180, 90],
          ],
        ],
      },
    },
  ],
};

const MapboxMap: FC<MapboxMapProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTool, setActiveTool] = useState<MapTool>(null);

  const initialViewState = {
    longitude: 34,
    latitude: 37.7853,
    zoom: 2,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Map
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={BaladUrl}
        preserveDrawingBuffer={true}
        style={{ width: "100%", height: "100%" }}
      >
        <MapResizeHandler />
        {/* ✅ Mapbox-native Dark Shadow Layer */}
        {/* This creates the shadow INSIDE the map context, allowing your Deck.gl layer to sit on top */}
        <Source
          id="dark-shadow-source"
          type="geojson"
          data={worldPolygon as any}
        >
          <Layer
            id="dark-shadow-layer"
            type="fill"
            paint={{
              "fill-color": "rgba(0, 0, 0, 0.2)", // 🎛️ Adjust your darkness here
            }}
          />
        </Source>

        {/* ✅ Children (AircraftLayer) will now render natively above or below Mapbox layers based on its configuration, not blocked by HTML */}
        {children}

        {/* Map Controls */}
        <MapControlBox position={ZOOM_BOX_POSITION}>
          <MapNavigator />
        </MapControlBox>

        <MapControlBox position={TOOLBAR_POSITION}>
          <MapDrawTools activeTool={activeTool} setActiveTool={setActiveTool} />
        </MapControlBox>

        <MapControlBox position={TOOLBAR_POSITION}>
          <ExtraMapTools />
        </MapControlBox>

        <MapControlBox position={MAP_VIEW}>
          <MapView />
        </MapControlBox>

        {!isMobile && (
          <MapControlBox position={COORDINATE_POSITION}>
            <CoordinateDisplay />
          </MapControlBox>
        )}
      </Map>
    </div>
  );
};

export default MapboxMap;
