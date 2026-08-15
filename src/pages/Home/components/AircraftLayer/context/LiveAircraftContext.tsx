import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Aircraft } from "../types/Aircraft";
import {
  advanceAircraftSim,
  buildTrackPath,
  initAircraftSim,
  type AircraftSimState,
} from "../utils/aircraftMovement";
import { useAircraftListQuery } from "../../../../../hooks/useAircraftQueries";
import {
  liveWebSocket,
  type WebSocketStatus,
} from "../../../../../services/websocketService";
import type { BboxParams } from "../../../../../services/types";

type TrackPoint = [number, number, number];
type Listener = () => void;

interface LiveAircraftContextValue {
  getAircraftById: (id: string) => Aircraft | null;
  getTrackPath: (id: string) => TrackPoint[];
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => Aircraft[];
  wsStatus: WebSocketStatus;
  isCached: boolean;
  lastUpdated: number | null;
  refreshFleet: () => Promise<void>;
  updateViewport: (bbox: BboxParams, zoom?: number) => void;
  currentViewport: (BboxParams & { zoom?: number }) | null;
  isLoading: boolean;
  isFetching: boolean;
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
  const fleetMapRef = useRef<Map<string, Aircraft>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());
  const aircraftRef = useRef<Aircraft[]>([]);

  const [wsStatus, setWsStatus] = useState<WebSocketStatus>("disconnected");
  const [isCached, setIsCached] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [currentViewport, setCurrentViewport] = useState<
    (BboxParams & { zoom?: number }) | null
  >(null);

  const activeRef = useRef(active);
  activeRef.current = active;

  const currentViewportRef = useRef(currentViewport);
  currentViewportRef.current = currentViewport;

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const getSnapshot = useCallback(() => aircraftRef.current, []);

  const notify = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  /**
   * Updates state with fresh real aircraft list from backend
   */
  const handleIncomingAircraft = useCallback(
    (incoming: Aircraft[] = [], cached: boolean = false, time?: number) => {
      const nowSec = time || Math.floor(Date.now() / 1000);
      const simMap = simStatesRef.current;
      const routeMap = routesRef.current;
      const fleetMap = fleetMapRef.current;
      const lastSeenMap = lastSeenRef.current;
      const vp = currentViewportRef.current;

      const incomingIds = new Set<string>();

      for (const item of incoming) {
        if (!item || !item.id) continue;
        incomingIds.add(item.id);
        fleetMap.set(item.id, item);
        lastSeenMap.set(item.id, nowSec);

        if (item.path && item.path.length > 0) {
          routeMap.set(item.id, item.path);
        }

        let sim = simMap.get(item.id);
        if (!sim) {
          sim = initAircraftSim(item);
          simMap.set(item.id, sim);
        } else {
          // Align sim state toward latest real telemetry
          const latDiff = Math.abs(sim.lat - item.lat);
          const lonDiff = Math.abs(sim.lon - item.lon);
          if (latDiff > 0.03 || lonDiff > 0.03) {
            sim = {
              ...sim,
              lat: item.lat,
              lon: item.lon,
              heading_deg: item.heading_deg,
            };
            simMap.set(item.id, sim);
          }
        }
      }

      // If we have a specific viewport bounding box with incoming results:
      // Prune aircraft that are not in the new batch and outside/stale
      for (const [id, seenTime] of lastSeenMap.entries()) {
        const item = fleetMap.get(id);
        const isStale = nowSec - seenTime > 120; // 2 minutes stale
        
        let isOutOfView = false;
        if (vp && item) {
          const latBuffer = 1.0;
          const lonBuffer = 1.5;
          const minLat = (vp.lamin ?? -90) - latBuffer;
          const maxLat = (vp.lamax ?? 90) + latBuffer;
          const minLon = (vp.lomin ?? -180) - lonBuffer;
          const maxLon = (vp.lomax ?? 180) + lonBuffer;
          if (
            item.lat < minLat ||
            item.lat > maxLat ||
            item.lon < minLon ||
            item.lon > maxLon
          ) {
            isOutOfView = true;
          }
        }

        if (isStale || (isOutOfView && !incomingIds.has(id))) {
          fleetMap.delete(id);
          simMap.delete(id);
          routeMap.delete(id);
          lastSeenMap.delete(id);
        }
      }

      // Reconstruct live aircraft snapshot
      aircraftRef.current = Array.from(fleetMap.values()).map((item) => {
        const sim = simMap.get(item.id);
        return {
          ...item,
          lat: sim ? sim.lat : item.lat,
          lon: sim ? sim.lon : item.lon,
          heading_deg: sim ? sim.heading_deg : item.heading_deg,
        };
      });

      setIsCached(cached);
      setLastUpdated(nowSec);
      notify();
    },
    [notify]
  );

  // React Query fetch whenever viewport (bbox or zoom) changes
  const aircraftQuery = useAircraftListQuery(currentViewport ?? undefined, {
    enabled: active,
  });

  // Sync React Query updates into live fleet
  useEffect(() => {
    if (aircraftQuery.data) {
      handleIncomingAircraft(
        aircraftQuery.data.aircraft || [],
        aircraftQuery.data.cached,
        aircraftQuery.data.time
      );
    }
  }, [aircraftQuery.data, handleIncomingAircraft]);

  const updateViewport = useCallback((bbox: BboxParams, zoom?: number) => {
    const nextViewport = { ...bbox, zoom };
    setCurrentViewport(nextViewport);
    liveWebSocket.setBbox(nextViewport);
  }, []);

  const refreshFleet = useCallback(async () => {
    try {
      await aircraftQuery.refetch();
    } catch (err) {
      console.warn("[LiveAircraft] Failed to refresh fleet with React Query:", err);
    }
  }, [aircraftQuery]);

  // WebSocket lifecycle - connects once and remains open
  useEffect(() => {
    if (!active) return;

    // Subscribe to WebSocket status & messages
    const unsubscribeStatus = liveWebSocket.onStatusChange((status) => {
      setWsStatus(status);
    });

    const unsubscribeMessages = liveWebSocket.onMessage((data) => {
      if (data && data.aircraft) {
        handleIncomingAircraft(data.aircraft, data.cached, data.time);
      }
    });

    liveWebSocket.connect(currentViewport ?? undefined);

    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      liveWebSocket.disconnect();
    };
  }, [active, handleIncomingAircraft]);

  // Smooth interpolation / simulation loop
  useEffect(() => {
    if (!active) return;

    let frameId = 0;
    let lastTime = performance.now();
    let renderAccumulator = 0;
    const renderInterval = 1 / 20;

    const tick = (now: number) => {
      if (!activeRef.current) return;

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      renderAccumulator += delta;

      const currentAircraftList = aircraftRef.current;
      for (const item of currentAircraftList) {
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
    (id: string) =>
      aircraftRef.current.find((item) => item.id === id) ||
      fleetMapRef.current.get(id) ||
      null,
    []
  );

  const getTrackPath = useCallback((id: string): TrackPoint[] => {
    const item =
      fleetMapRef.current.get(id) ||
      aircraftRef.current.find((a) => a.id === id);
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
      wsStatus,
      isCached,
      lastUpdated,
      refreshFleet,
      updateViewport,
      currentViewport,
      isLoading: aircraftQuery.isLoading,
      isFetching: aircraftQuery.isFetching,
    }),
    [
      getAircraftById,
      getTrackPath,
      subscribe,
      getSnapshot,
      wsStatus,
      isCached,
      lastUpdated,
      refreshFleet,
      updateViewport,
      currentViewport,
      aircraftQuery.isLoading,
      aircraftQuery.isFetching,
    ]
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
    throw new Error(
      "useLiveAircraftSnapshot must be used within LiveAircraftProvider"
    );
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
    throw new Error(
      "useLiveAircraftEngine must be used within LiveAircraftProvider"
    );
  }
  return context;
}
