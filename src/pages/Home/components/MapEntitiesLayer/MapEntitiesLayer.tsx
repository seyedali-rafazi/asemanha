import { useCallback, useMemo } from "react";
import DeckGLOverlay from "../../../../components/map/components/DeckGLOverlay/DeckGLOverlay";
import { useAircraft } from "../AircraftLayer/context/AircraftContext";
import {
  useLiveAircraftEngine,
  useLiveAircraftSnapshot,
} from "../AircraftLayer/context/LiveAircraftContext";
import { createAircraftIconLayer } from "../AircraftLayer/layers/createAircraftLayer";
import { createFlightPathLayer } from "../AircraftLayer/layers/createFlightPathLayer";
import type { Aircraft } from "../AircraftLayer/types/Aircraft";
import { createAirportLayer } from "../AirportLayer/layers/createAirportLayer";
import type { Airport } from "../AirportLayer/types/Airport";
import { createAntennaLayer } from "../AntennaLayer/layers/createAntennaLayer";
import type { Antenna } from "../AntennaLayer/types/Antenna";
import { useMapLayers } from "../../context/MapLayersContext";
import { useStableMapCursor } from "../../hooks/useStableMapCursor";
import { useAppSelector } from "../../../../store/hooks";
import {
  isDrawToolActive,
  useMapTool,
} from "../../../../components/map/context/MapToolContext";

interface MapEntitiesLayerProps {
  active?: boolean;
}

const MapEntitiesLayer = ({ active = true }: MapEntitiesLayerProps) => {
  const { isItemVisible, selectEntity, airports, antennas } = useMapLayers();
  const { tracks } = useAircraft();
  const liveAircraft = useLiveAircraftSnapshot();
  const { getTrackPath, getMotionVersion } = useLiveAircraftEngine();
  const motionVersion = getMotionVersion();
  const handleHover = useStableMapCursor("map-entities");
  const { airplaneSize, showAirplaneAltitude, mapStyleId } = useAppSelector(
    (state) => state.settings
  );
  const { activeTool } = useMapTool();
  const pickable = !isDrawToolActive(activeTool);

  // Filter by visibility/membership only. Positions mutate in place on these objects.
  const visibleAirplanes = useMemo(
    () => (active ? liveAircraft.filter((a) => isItemVisible("airplanes", a.id)) : []),
    [active, liveAircraft, isItemVisible]
  );

  const visibleAirports = useMemo(
    () => (active ? airports.filter((a) => isItemVisible("airports", a.id)) : []),
    [active, airports, isItemVisible]
  );

  const visibleAntennas = useMemo(
    () => (active ? antennas.filter((a) => isItemVisible("antennas", a.id)) : []),
    [active, antennas, isItemVisible]
  );


  const handleAircraftClick = useCallback(
    (aircraft: Aircraft) => selectEntity("airplanes", aircraft.id),
    [selectEntity]
  );

  const handleAirportClick = useCallback(
    (airport: Airport) => selectEntity("airports", airport.id),
    [selectEntity]
  );

  const handleAntennaClick = useCallback(
    (antenna: Antenna) => selectEntity("antennas", antenna.id),
    [selectEntity]
  );

  const visibleTracks = useMemo(
    () => tracks.filter((t) => t.visible),
    [tracks]
  );

  const staticLayers = useMemo(() => {
    if (!active) return [];
    const result = [];

    if (visibleAirports.length > 0) {
      result.push(
        createAirportLayer(visibleAirports, {
          onAirportClick: handleAirportClick,
          onAirportHover: handleHover,
          pickable,
        })
      );
    }

    if (visibleAntennas.length > 0) {
      result.push(
        createAntennaLayer(visibleAntennas, {
          onAntennaClick: handleAntennaClick,
          onAntennaHover: handleHover,
          pickable,
        })
      );
    }

    return result;
  }, [
    active,
    visibleAirports,
    visibleAntennas,
    handleAirportClick,
    handleAntennaClick,
    handleHover,
    pickable,
  ]);

  const layers = useMemo(() => {
    if (!active) return [];
    const result = [...staticLayers];

    visibleTracks.forEach((track) => {
      const aircraft = liveAircraft.find((a) => a.id === track.aircraftId);
      if (aircraft) {
        const pathLayers = createFlightPathLayer(
          aircraft,
          getTrackPath(track.aircraftId)
        );
        if (pathLayers) result.push(...pathLayers);
      }
    });

    if (visibleAirplanes.length > 0) {
      result.push(
        ...createAircraftIconLayer(visibleAirplanes, {
          onAircraftClick: handleAircraftClick,
          onAircraftHover: handleHover,
          iconSize: airplaneSize,
          showAltitude: showAirplaneAltitude,
          pickable,
          motionVersion,
        })
      );
    }

    return result;
  }, [
    active,
    staticLayers,
    visibleTracks,
    liveAircraft,
    getTrackPath,
    visibleAirplanes,
    handleAircraftClick,
    handleHover,
    airplaneSize,
    showAirplaneAltitude,
    pickable,
    motionVersion,
  ]);

  return <DeckGLOverlay key={mapStyleId} layers={layers} />;
};

export default MapEntitiesLayer;
