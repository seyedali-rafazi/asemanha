import { useCallback, useMemo } from "react";
import DeckGLOverlay from "../../../../components/map/components/DeckGLOverlay/DeckGLOverlay";
import { useAircraft } from "../AircraftLayer/context/AircraftContext";
import aircraftData from "../AircraftLayer/data/iran_aircraft_50.json";
import { createAircraftIconLayer } from "../AircraftLayer/layers/createAircraftLayer";
import { createFlightPathLayer } from "../AircraftLayer/layers/createFlightPathLayer";
import type { Aircraft } from "../AircraftLayer/types/Aircraft";
import airportData from "../AirportLayer/data/iran_airports.json";
import { createAirportLayer } from "../AirportLayer/layers/createAirportLayer";
import type { Airport } from "../AirportLayer/types/Airport";
import antennaData from "../AntennaLayer/data/iran_antennas.json";
import { createAntennaLayer } from "../AntennaLayer/layers/createAntennaLayer";
import type { Antenna } from "../AntennaLayer/types/Antenna";
import { useMapLayers } from "../../context/MapLayersContext";
import { useStableMapCursor } from "../../hooks/useStableMapCursor";
import { useAppSelector } from "../../../../store/hooks";
import {
  isDrawToolActive,
  useMapTool,
} from "../../../../components/map/context/MapToolContext";

const MapEntitiesLayer = () => {
  const { isItemVisible, selectEntity } = useMapLayers();
  const { tracks } = useAircraft();
  const handleHover = useStableMapCursor("map-entities");
  const { airplaneSize, showAirplaneAltitude, mapStyleId } = useAppSelector(
    (state) => state.settings
  );
  const { activeTool } = useMapTool();
  const pickable = !isDrawToolActive(activeTool);

  const visibleAirplanes = useMemo(
    () =>
      (aircraftData as Aircraft[]).filter((a) =>
        isItemVisible("airplanes", a.id)
      ),
    [isItemVisible]
  );

  const visibleAirports = useMemo(
    () =>
      (airportData as Airport[]).filter((a) =>
        isItemVisible("airports", a.id)
      ),
    [isItemVisible]
  );

  const visibleAntennas = useMemo(
    () =>
      (antennaData as Antenna[]).filter((a) =>
        isItemVisible("antennas", a.id)
      ),
    [isItemVisible]
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

  const layers = useMemo(() => {
    const result = [];

    tracks
      .filter((t) => t.visible)
      .forEach((track) => {
        const aircraft = (aircraftData as Aircraft[]).find(
          (a) => a.id === track.aircraftId
        );
        if (aircraft) {
          const pathLayers = createFlightPathLayer(aircraft);
          if (pathLayers) result.push(...pathLayers);
        }
      });

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

    if (visibleAirplanes.length > 0) {
      result.push(
        ...createAircraftIconLayer(visibleAirplanes, {
          onAircraftClick: handleAircraftClick,
          onAircraftHover: handleHover,
          iconSize: airplaneSize,
          showAltitude: showAirplaneAltitude,
          pickable,
        })
      );
    }

    return result;
  }, [
    tracks,
    visibleAirplanes,
    visibleAirports,
    visibleAntennas,
    handleAircraftClick,
    handleAirportClick,
    handleAntennaClick,
    handleHover,
    airplaneSize,
    showAirplaneAltitude,
    pickable,
    activeTool,
    mapStyleId,
  ]);

  return <DeckGLOverlay key={mapStyleId} layers={layers} />;
};

export default MapEntitiesLayer;
