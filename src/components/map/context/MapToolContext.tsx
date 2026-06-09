import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type ActiveTool = string | null;

interface MapToolContextValue {
  activeTool: ActiveTool;
  setActiveTool: Dispatch<SetStateAction<ActiveTool>>;
}

const MapToolContext = createContext<MapToolContextValue>({
  activeTool: null,
  setActiveTool: () => {},
});

export function MapToolProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);

  const value = useMemo(
    () => ({ activeTool, setActiveTool }),
    [activeTool]
  );

  return (
    <MapToolContext.Provider value={value}>{children}</MapToolContext.Provider>
  );
}

export function useMapTool() {
  return useContext(MapToolContext);
}

/**
 * Drives a single tool's on/off state through the shared active-tool slot so
 * that activating one tool automatically deactivates any other. The returned
 * setter is API-compatible with a `useState<boolean>` setter, so existing
 * tool controls can adopt it with a one-line change.
 */
export function useExclusiveTool(
  id: string
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const { activeTool, setActiveTool } = useContext(MapToolContext);
  const isActive = activeTool === id;

  const setIsActive = useCallback<Dispatch<SetStateAction<boolean>>>(
    (action) => {
      setActiveTool((prev) => {
        const currentlyActive = prev === id;
        const next =
          typeof action === "function"
            ? (action as (p: boolean) => boolean)(currentlyActive)
            : action;
        if (next) return id;
        return currentlyActive ? null : prev;
      });
    },
    [id, setActiveTool]
  );

  return [isActive, setIsActive];
}

export function isDrawToolActive(tool: ActiveTool) {
  return tool === "marker" || tool === "line" || tool === "freedraw";
}
