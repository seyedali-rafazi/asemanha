import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
export interface DrawnTrack {
  aircraftId: string;
  visible: boolean;
}

interface AircraftContextValue {
  tracks: DrawnTrack[];
  addTrack: (aircraftId: string) => void;
  removeTrack: (aircraftId: string) => void;
  toggleTrackVisibility: (aircraftId: string) => void;
  hasTrack: (aircraftId: string) => boolean;
  isTrackVisible: (aircraftId: string) => boolean;
}

const AircraftContext = createContext<AircraftContextValue | null>(null);

export function AircraftProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<DrawnTrack[]>([]);

  const addTrack = useCallback((aircraftId: string) => {
    setTracks((prev) => {
      if (prev.some((t) => t.aircraftId === aircraftId)) return prev;
      return [...prev, { aircraftId, visible: true }];
    });
  }, []);

  const removeTrack = useCallback((aircraftId: string) => {
    setTracks((prev) => prev.filter((t) => t.aircraftId !== aircraftId));
  }, []);

  const toggleTrackVisibility = useCallback((aircraftId: string) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.aircraftId === aircraftId ? { ...t, visible: !t.visible } : t
      )
    );
  }, []);

  const hasTrack = useCallback(
    (aircraftId: string) => tracks.some((t) => t.aircraftId === aircraftId),
    [tracks]
  );

  const isTrackVisible = useCallback(
    (aircraftId: string) =>
      tracks.some((t) => t.aircraftId === aircraftId && t.visible),
    [tracks]
  );

  const value = useMemo(
    () => ({
      tracks,
      addTrack,
      removeTrack,
      toggleTrackVisibility,
      hasTrack,
      isTrackVisible,
    }),
    [tracks, addTrack, removeTrack, toggleTrackVisibility, hasTrack, isTrackVisible]
  );

  return (
    <AircraftContext.Provider value={value}>{children}</AircraftContext.Provider>
  );
}

export function useAircraft() {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error("useAircraft must be used within an AircraftProvider");
  }
  return context;
}
