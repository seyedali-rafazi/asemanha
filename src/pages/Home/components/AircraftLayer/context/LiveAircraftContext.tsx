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
  advanceAircraftSimInPlace,
  buildTrackPath,
  initAircraftSim,
  normalizeHeading,
  resolveHeadingDeg,
  type AircraftSimState,
} from "../utils/aircraftMovement";
import { useLocation } from "react-router-dom";
import { useAircraftListQuery } from "../../../../../hooks/useAircraftQueries";
import type { WebSocketStatus } from "../../../../../services/websocketService";
import type { BboxParams } from "../../../../../services/types";
import {
  DEFAULT_MIDDLE_EAST_BBOX,
  DEFAULT_MIDDLE_EAST_MOBILE_BBOX,
} from "../../../../../components/map/utils/mapDefaults";

export { DEFAULT_MIDDLE_EAST_BBOX, DEFAULT_MIDDLE_EAST_MOBILE_BBOX };

type TrackPoint = [number, number, number];
type Listener = () => void;

interface LiveAircraftContextValue {
  getAircraftById: (id: string) => Aircraft | null;
  getTrackPath: (id: string) => TrackPoint[];
  /** High-rate: position/heading animation (~20 Hz). Map should use this. */
  subscribeMotion: (listener: Listener) => () => void;
  /** Low-rate: fleet membership / telemetry refresh. Lists/panels should use this. */
  subscribeFleet: (listener: Listener) => () => void;
  /** @deprecated Prefer subscribeMotion or subscribeFleet */
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => Aircraft[];
  getMotionVersion: () => number;
  getTelemetryVersion: () => number;
  wsStatus: WebSocketStatus;
  isCached: boolean;
  lastUpdated: number | null;
  refreshFleet: () => Promise<void>;
  updateViewport: (bbox: BboxParams, zoom?: number) => void;
  currentViewport: (BboxParams & { zoom?: number }) | null;
  isLoading: boolean;
  isFetching: boolean;
}

interface LiveAircraftProviderProps {
  children: ReactNode;
  active?: boolean;
}

const LiveAircraftContext = createContext<LiveAircraftContextValue | null>(null);

/** Degrees of padding around the viewport for simulation (skip far off-screen planes). */
const SIM_VIEW_BUFFER_DEG = 0.75;

function isInSimViewport(
  lat: number,
  lon: number,
  vp: BboxParams | null
): boolean {
  if (!vp) return true;
  const minLat = (vp.lamin ?? -90) - SIM_VIEW_BUFFER_DEG;
  const maxLat = (vp.lamax ?? 90) + SIM_VIEW_BUFFER_DEG;
  const minLon = (vp.lomin ?? -180) - SIM_VIEW_BUFFER_DEG;
  const maxLon = (vp.lomax ?? 180) + SIM_VIEW_BUFFER_DEG;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}

export function LiveAircraftProvider({
  children,
  active = true,
}: LiveAircraftProviderProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isEffectiveActive = Boolean(active && isHome);

  const motionListenersRef = useRef<Set<Listener>>(new Set());
  const fleetListenersRef = useRef<Set<Listener>>(new Set());
  const simStatesRef = useRef<Map<string, AircraftSimState>>(new Map());
  const routesRef = useRef<Map<string, [number, number][]>>(new Map());
  const fleetMapRef = useRef<Map<string, Aircraft>>(new Map());
  const lastSeenRef = useRef<Map<string, number>>(new Map());
  const aircraftRef = useRef<Aircraft[]>([]);
  const motionVersionRef = useRef(0);
  const telemetryVersionRef = useRef(0);

  const [wsStatus] = useState<WebSocketStatus>("disconnected");
  const [isCached, setIsCached] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [currentViewport, setCurrentViewport] = useState<
    (BboxParams & { zoom?: number }) | null
  >(() => {
    if (typeof window !== "undefined" && window.innerWidth < 600) {
      return DEFAULT_MIDDLE_EAST_MOBILE_BBOX;
    }
    return DEFAULT_MIDDLE_EAST_BBOX;
  });

  const activeRef = useRef(isEffectiveActive);
  activeRef.current = isEffectiveActive;

  const currentViewportRef = useRef(currentViewport);
  currentViewportRef.current = currentViewport;

  const subscribeMotion = useCallback((listener: Listener) => {
    motionListenersRef.current.add(listener);
    return () => motionListenersRef.current.delete(listener);
  }, []);

  const subscribeFleet = useCallback((listener: Listener) => {
    fleetListenersRef.current.add(listener);
    return () => fleetListenersRef.current.delete(listener);
  }, []);

  /** Legacy: both channels (prefer explicit hooks). */
  const subscribe = useCallback((listener: Listener) => {
    motionListenersRef.current.add(listener);
    fleetListenersRef.current.add(listener);
    return () => {
      motionListenersRef.current.delete(listener);
      fleetListenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => aircraftRef.current, []);
  const getMotionVersion = useCallback(() => motionVersionRef.current, []);
  const getTelemetryVersion = useCallback(() => telemetryVersionRef.current, []);

  const notifyMotion = useCallback(() => {
    motionListenersRef.current.forEach((listener) => listener());
  }, []);

  const notifyFleet = useCallback(() => {
    fleetListenersRef.current.forEach((listener) => listener());
  }, []);

  /**
   * Merge telemetry into the live fleet in place.
   * Never clears the whole list and rebuilds — add / update / soft-remove only.
   */
  const handleIncomingAircraft = useCallback(
    (incoming: Aircraft[] = [], cached: boolean = false, time?: number) => {
      const nowSec = time || Math.floor(Date.now() / 1000);
      const simMap = simStatesRef.current;
      const routeMap = routesRef.current;
      const fleetMap = fleetMapRef.current;
      const lastSeenMap = lastSeenRef.current;
      const vp = currentViewportRef.current;
      const liveList = aircraftRef.current;
      const liveById = new Map(liveList.map((a) => [a.id, a]));

      // Empty / failed payloads must not wipe the map.
      if (!incoming.length) {
        let removed = false;
        for (const [id, seenTime] of [...lastSeenMap.entries()]) {
          if (nowSec - seenTime <= 120) continue;
          fleetMap.delete(id);
          simMap.delete(id);
          routeMap.delete(id);
          lastSeenMap.delete(id);
          if (liveById.delete(id)) removed = true;
        }
        if (removed) {
          aircraftRef.current = liveList.filter((a) => liveById.has(a.id));
          motionVersionRef.current += 1;
          telemetryVersionRef.current += 1;
          notifyMotion();
          notifyFleet();
        }
        setIsCached(cached);
        setLastUpdated(nowSec);
        return;
      }

      const incomingIds = new Set<string>();
      let membershipChanged = false;
      let metadataTouched = false;

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
          const latDiff = Math.abs(sim.lat - item.lat);
          const lonDiff = Math.abs(sim.lon - item.lon);
          if (latDiff > 0.03 || lonDiff > 0.03) {
            sim.lat = item.lat;
            sim.lon = item.lon;
          }
          const nextHeading = normalizeHeading(item.heading_deg);
          if (nextHeading !== null) {
            sim.heading_deg = nextHeading;
          } else if (!Number.isFinite(sim.heading_deg)) {
            sim.heading_deg = resolveHeadingDeg(
              item,
              sim.lat,
              sim.lon,
              sim.segmentIndex
            );
          }
        }

        const existing = liveById.get(item.id);
        if (existing) {
          // Update fields in place — keep the same object identity for Deck.gl.
          existing.callsign = item.callsign;
          existing.airline = item.airline;
          existing.aircraftType = item.aircraftType;
          existing.aircraft_icao = item.aircraft_icao;
          existing.category = item.category;
          existing.model = item.model;
          existing.manufacturer = item.manufacturer;
          existing.altitude_ft = item.altitude_ft;
          existing.speed_kts = item.speed_kts;
          existing.origin_city = item.origin_city;
          existing.destination_city = item.destination_city;
          existing.path = item.path;
          existing.lastUpdate = item.lastUpdate;
          existing.lat = sim.lat;
          existing.lon = sim.lon;
          existing.heading_deg = Number.isFinite(sim.heading_deg)
            ? sim.heading_deg
            : resolveHeadingDeg(item, sim.lat, sim.lon, sim.segmentIndex);
          metadataTouched = true;
        } else {
          const live: Aircraft = {
            ...item,
            lat: sim.lat,
            lon: sim.lon,
            heading_deg: Number.isFinite(sim.heading_deg)
              ? sim.heading_deg
              : resolveHeadingDeg(item, sim.lat, sim.lon, sim.segmentIndex),
          };
          liveList.push(live);
          liveById.set(item.id, live);
          membershipChanged = true;
        }
      }

      // Soft prune: stale, or outside view and missing from this non-empty batch for a while.
      const toRemove: string[] = [];
      for (const [id, seenTime] of lastSeenMap.entries()) {
        const item = fleetMap.get(id);
        const age = nowSec - seenTime;
        const isStale = age > 120;

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

        // Grace period so a partial/new-bbox response does not wipe the fleet.
        const missingLongEnough = age > 45;
        if (
          isStale ||
          (isOutOfView && !incomingIds.has(id) && missingLongEnough)
        ) {
          toRemove.push(id);
        }
      }

      if (toRemove.length > 0) {
        for (const id of toRemove) {
          fleetMap.delete(id);
          simMap.delete(id);
          routeMap.delete(id);
          lastSeenMap.delete(id);
          liveById.delete(id);
        }
        aircraftRef.current = liveList.filter((a) => liveById.has(a.id));
        membershipChanged = true;
      } else if (membershipChanged) {
        // New planes were pushed onto the same array — expose a new ref for subscribers.
        aircraftRef.current = liveList.slice();
      }

      motionVersionRef.current += 1;
      setIsCached(cached);
      setLastUpdated(nowSec);
      notifyMotion();
      if (membershipChanged || metadataTouched) {
        // Fleet hook compares snapshot by reference; ensure it changes.
        if (aircraftRef.current === liveList) {
          aircraftRef.current = liveList.slice();
        }
        telemetryVersionRef.current += 1;
        notifyFleet();
      }
    },
    [notifyMotion, notifyFleet]
  );

  const aircraftQuery = useAircraftListQuery(currentViewport ?? undefined, {
    enabled: isEffectiveActive,
    refetchInterval: 10000,
  });

  // Sync React Query updates into live fleet (skip placeholder/previous bbox data).
  useEffect(() => {
    if (!aircraftQuery.data || aircraftQuery.isPlaceholderData) return;
    handleIncomingAircraft(
      aircraftQuery.data.aircraft || [],
      aircraftQuery.data.cached,
      aircraftQuery.data.time
    );
  }, [
    aircraftQuery.data,
    aircraftQuery.isPlaceholderData,
    handleIncomingAircraft,
  ]);

  const updateViewport = useCallback((bbox: BboxParams, zoom?: number) => {
    const nextViewport = { ...bbox, zoom };
    setCurrentViewport(nextViewport);
    currentViewportRef.current = nextViewport;
  }, []);

  const refreshFleet = useCallback(async () => {
    try {
      await aircraftQuery.refetch();
    } catch (err) {
      console.warn("[LiveAircraft] Failed to refresh fleet with React Query:", err);
    }
  }, [aircraftQuery]);

  // Smooth interpolation — sim + publish at 20 Hz (not every rAF)
  useEffect(() => {
    if (!isEffectiveActive) return;

    let frameId = 0;
    let lastTime = performance.now();
    let renderAccumulator = 0;
    const renderInterval = 1 / 20;

    const tick = (now: number) => {
      if (!activeRef.current) return;

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      renderAccumulator += delta;

      if (renderAccumulator >= renderInterval) {
        const simDelta = renderAccumulator;
        renderAccumulator = 0;

        const list = aircraftRef.current;
        const vp = currentViewportRef.current;
        const simMap = simStatesRef.current;
        const routeMap = routesRef.current;
        let moved = false;

        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          // Skip CPU work for planes well outside the current camera.
          if (!isInSimViewport(item.lat, item.lon, vp)) continue;

          const route = routeMap.get(item.id) ?? item.path;
          let sim = simMap.get(item.id);
          if (!sim) {
            sim = initAircraftSim(item);
            simMap.set(item.id, sim);
          }

          advanceAircraftSimInPlace(sim, route, item.speed_kts, simDelta);
          item.lat = sim.lat;
          item.lon = sim.lon;
          item.heading_deg = Number.isFinite(sim.heading_deg)
            ? sim.heading_deg
            : resolveHeadingDeg(item, sim.lat, sim.lon, sim.segmentIndex);
          moved = true;
        }

        if (moved) {
          motionVersionRef.current += 1;
          // Same array + mutated objects; consumers re-render via motionVersion.
          notifyMotion();
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isEffectiveActive, notifyMotion]);

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
      subscribeMotion,
      subscribeFleet,
      subscribe,
      getSnapshot,
      getMotionVersion,
      getTelemetryVersion,
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
      subscribeMotion,
      subscribeFleet,
      subscribe,
      getSnapshot,
      getMotionVersion,
      getTelemetryVersion,
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

/** High-rate positions for the map (animation). Prefer motionVersion + getSnapshot. */
export function useLiveAircraftSnapshot(): Aircraft[] {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error(
      "useLiveAircraftSnapshot must be used within LiveAircraftProvider"
    );
  }
  // Re-render when motionVersion changes; snapshot array ref is stable between fleet updates.
  useSyncExternalStore(
    context.subscribeMotion,
    context.getMotionVersion,
    context.getMotionVersion
  );
  return context.getSnapshot();
}

/** Low-rate fleet membership for lists/panels (not every animation tick). */
export function useLiveAircraftFleetSnapshot(): Aircraft[] {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error(
      "useLiveAircraftFleetSnapshot must be used within LiveAircraftProvider"
    );
  }
  return useSyncExternalStore(
    context.subscribeFleet,
    context.getSnapshot,
    context.getSnapshot
  );
}

export function useLiveAircraftMotionVersion(): number {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error(
      "useLiveAircraftMotionVersion must be used within LiveAircraftProvider"
    );
  }
  return useSyncExternalStore(
    context.subscribeMotion,
    context.getMotionVersion,
    context.getMotionVersion
  );
}

export function useLiveAircraftTelemetryVersion(): number {
  const context = useContext(LiveAircraftContext);
  if (!context) {
    throw new Error(
      "useLiveAircraftTelemetryVersion must be used within LiveAircraftProvider"
    );
  }
  return useSyncExternalStore(
    context.subscribeFleet,
    context.getTelemetryVersion,
    context.getTelemetryVersion
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
