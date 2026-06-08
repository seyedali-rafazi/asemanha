import { createContext, useContext, type ReactNode } from "react";
import type { MapTool } from "../types/MapTypes";

interface MapToolContextValue {
  activeTool: MapTool;
}

const MapToolContext = createContext<MapToolContextValue>({ activeTool: null });

export function MapToolProvider({
  activeTool,
  children,
}: {
  activeTool: MapTool;
  children: ReactNode;
}) {
  return (
    <MapToolContext.Provider value={{ activeTool }}>
      {children}
    </MapToolContext.Provider>
  );
}

export function useMapTool() {
  return useContext(MapToolContext);
}

export function isDrawToolActive(tool: MapTool) {
  return tool === "marker" || tool === "line" || tool === "freedraw";
}
