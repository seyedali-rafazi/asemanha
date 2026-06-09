import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { BASE_AIRCRAFT } from "../data/aircraftFleet";
import type { Aircraft } from "../types/Aircraft";
import {
  advanceAircraftSim,
  buildTrackPath,
  initAircraftSim,
  type AircraftSimState,
} from "../utils/aircraftMovement";

export { BASE_AIRCRAFT } from "../data/aircraftFleet";

type TrackPoint = [number, number, number];
type Listener = () => void;

interface LiveAircraftContextValue {
  getAircraftById: (id: string) => Aircraft | null;
  getTrackPath: (id: string) => TrackPoint[];
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => Aircraft[];
}

const LiveAircraftContext = createContext<LiveAircraftContextValue | null>(null);

export function LiveAircraftProvider({
  children,
  active = true,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  const listenersRef = useRef<Set<Listener>>(new Set());
  const simStatesRef = useRef<Map<string, AircraftSimState>>(new Map());
  const routesRef = useRef<Map<string, [number, number][]>>(new Map());
  const aircraftRef = useRef<Aircraft[]>([]);

  if (aircraftRef.current.length === 0) {
    const simMap = new Map<string, AircraftSimState>();
    const routeMap = new Map<string, [number, number][]>();

    aircraftRef.current = BASE_AIRCRAFT.map((item) => {
      const sim = initAircraftSim(item);
      simMap.set(item.id, sim);
      routeMap.set(item.id, item.path);
      return {
        ...item,
        lat: sim.lat,
        lon: sim.lon,
        heading_deg: sim.heading_deg,
      };
    });

    simStatesRef.current = simMap;
    routesRef.current = routeMap;
  }

  // Mirror `active` into a ref synchronously during render so the rAF loop can
  // halt immediately when we navigate away. Relying on effect cleanup is not
  // enough: the high-frequency store notifications can starve React's render of
  // the next page, which prevents the cleanup effect from ever running.
  const activeRef = useRef(active);
  activeRef.current = active;

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const getSnapshot = useCallback(() => aircraftRef.current, []);

  const notify = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    if (!active) return;

    let frameId = 0;
    let lastTime = performance.now();
    let renderAccumulator = 0;
    const renderInterval = 1 / 20;

    const tick = (now: number) => {
      // Halt immediately the moment we leave home, before doing any work or
      // notifying subscribers, so navigation renders are never starved.
      if (!activeRef.current) return;

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      renderAccumulator += delta;

      for (const item of BASE_AIRCRAFT) {
        const route = routesRef.current.get(item.id) ?? item.path;
        const currentSim =
          simStatesRef.current.get(item.id) ?? initAircraftSim(item);
        const nextSim = advanceAircraftSim(
          currentSim,
          route,
          item.speed_kts,
          delta
        );
        simStatesRef.current.set(item.id, nextSim);
      }

      if (renderAccumulator >= renderInterval) {
        renderAccumulator = 0;
        aircraftRef.current = aircraftRef.current.map((item) => {
          const sim = simStatesRef.current.get(item.id);
          if (!sim) return item;
          return {
            ...item,
            lat: sim.lat,
            lon: sim.lon,
            heading_deg: sim.heading_deg,
          };
        });
        notify();
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [active, notify]);

  const getAircraftById = useCallback(
    (id: string) => aircraftRef.current.find((item) => item.id === id) ?? null,
    []
  );

  const getTrackPath = useCallback((id: string): TrackPoint[] => {
    const item = BASE_AIRCRAFT.find((a) => a.id === id);
    if (!item) return [];

    const sim = simStatesRef.current.get(id);
    const live = aircraftRef.current.find((a) => a.id === id);
    const merged = live ? { ...item, ...live } : item;
    return buildTrackPath(merged, sim);
  }, []);

  const value = useMemo(
    () => ({
      getAircraftById,
      getTrackPath,
      subscribe,
      getSnapshot,
    }),
    [getAircraftById, getTrackPath, subscribe, getSnapshot]
  );

  return (
    <LiveAircraftContext.Provider value={value}>
      {children}
    </LiveAircraftContext.Provider>
  );
}

export function useLiveAircraftSnapshot(): Aircraft[] {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error("useLiveAircraftSnapshot must be used within LiveAircraftProvider");
  }
  return useSyncExternalStore(
    context.subscribe,
    context.getSnapshot,
    context.getSnapshot
  );
}

export function useLiveAircraftEngine() {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error("useLiveAircraftEngine must be used within LiveAircraftProvider");
  }
  return context;
}
