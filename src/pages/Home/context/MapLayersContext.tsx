import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import aircraftData from "../components/AircraftLayer/data/iran_aircraft_50.json";
import airportData from "../components/AirportLayer/data/iran_airports.json";
import antennaData from "../components/AntennaLayer/data/iran_antennas.json";
import type { Aircraft } from "../components/AircraftLayer/types/Aircraft";
import type { Airport } from "../components/AirportLayer/types/Airport";
import type { Antenna } from "../components/AntennaLayer/types/Antenna";

export type LayerCategory = "airplanes" | "airports" | "antennas";

export type MapEntity = Aircraft | Airport | Antenna;

type ItemVisibility = Record<LayerCategory, Record<string, boolean>>;

interface MapLayersContextValue {
  activeCategory: LayerCategory;
  setActiveCategory: (category: LayerCategory) => void;
  categoryEnabled: Record<LayerCategory, boolean>;
  toggleCategory: (category: LayerCategory) => void;
  itemVisibility: ItemVisibility;
  toggleItemVisibility: (category: LayerCategory, id: string) => void;
  isItemVisible: (category: LayerCategory, id: string) => boolean;
  setCategoryItemsVisibility: (category: LayerCategory, visible: boolean) => void;
  searchQuery: Record<LayerCategory, string>;
  setSearchQuery: (category: LayerCategory, query: string) => void;
  selectedEntity: { category: LayerCategory; id: string } | null;
  selectEntity: (category: LayerCategory, id: string | null) => void;
  getEntityData: (category: LayerCategory, id: string) => MapEntity | null;
  getSelectedEntityData: () => MapEntity | null;
  airplanes: Aircraft[];
  airports: Airport[];
  antennas: Antenna[];
}

const MapLayersContext = createContext<MapLayersContextValue | null>(null);

function buildDefaultVisibility(
  airplanes: Aircraft[],
  airports: Airport[],
  antennas: Antenna[]
): ItemVisibility {
  return {
    airplanes: Object.fromEntries(airplanes.map((a) => [a.id, true])),
    airports: Object.fromEntries(airports.map((a) => [a.id, true])),
    antennas: Object.fromEntries(antennas.map((a) => [a.id, true])),
  };
}

export function MapLayersProvider({ children }: { children: ReactNode }) {
  const airplanes = aircraftData as Aircraft[];
  const airports = airportData as Airport[];
  const antennas = antennaData as Antenna[];

  const [activeCategory, setActiveCategory] =
    useState<LayerCategory>("airplanes");
  const [categoryEnabled, setCategoryEnabled] = useState<
    Record<LayerCategory, boolean>
  >({
    airplanes: true,
    airports: true,
    antennas: true,
  });
  const [itemVisibility, setItemVisibility] = useState<ItemVisibility>(() =>
    buildDefaultVisibility(airplanes, airports, antennas)
  );
  const [searchQuery, setSearchQueryState] = useState<
    Record<LayerCategory, string>
  >({
    airplanes: "",
    airports: "",
    antennas: "",
  });
  const [selectedEntity, setSelectedEntity] = useState<{
    category: LayerCategory;
    id: string;
  } | null>(null);

  const toggleCategory = useCallback((category: LayerCategory) => {
    setCategoryEnabled((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const toggleItemVisibility = useCallback(
    (category: LayerCategory, id: string) => {
      setItemVisibility((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [id]: !prev[category][id],
        },
      }));
    },
    []
  );

  const isItemVisible = useCallback(
    (category: LayerCategory, id: string) => {
      if (!categoryEnabled[category]) return false;
      return itemVisibility[category][id] ?? true;
    },
    [categoryEnabled, itemVisibility]
  );

  const setCategoryItemsVisibility = useCallback(
    (category: LayerCategory, visible: boolean) => {
      setItemVisibility((prev) => ({
        ...prev,
        [category]: Object.fromEntries(
          Object.keys(prev[category]).map((id) => [id, visible])
        ),
      }));
    },
    []
  );

  const setSearchQuery = useCallback(
    (category: LayerCategory, query: string) => {
      setSearchQueryState((prev) => ({ ...prev, [category]: query }));
    },
    []
  );

  const getEntityData = useCallback(
    (category: LayerCategory, id: string): MapEntity | null => {
      if (category === "airplanes") {
        return airplanes.find((a) => a.id === id) ?? null;
      }
      if (category === "airports") {
        return airports.find((a) => a.id === id) ?? null;
      }
      return antennas.find((a) => a.id === id) ?? null;
    },
    [airplanes, airports, antennas]
  );

  const selectEntity = useCallback(
    (category: LayerCategory, id: string | null) => {
      setSelectedEntity(id ? { category, id } : null);
      if (id) {
        setActiveCategory(category);
      }
    },
    []
  );

  const getSelectedEntityData = useCallback((): MapEntity | null => {
    if (!selectedEntity) return null;
    return getEntityData(selectedEntity.category, selectedEntity.id);
  }, [selectedEntity, getEntityData]);

  const value = useMemo(
    () => ({
      activeCategory,
      setActiveCategory,
      categoryEnabled,
      toggleCategory,
      itemVisibility,
      toggleItemVisibility,
      isItemVisible,
      setCategoryItemsVisibility,
      searchQuery,
      setSearchQuery,
      selectedEntity,
      selectEntity,
      getEntityData,
      getSelectedEntityData,
      airplanes,
      airports,
      antennas,
    }),
    [
      activeCategory,
      categoryEnabled,
      toggleCategory,
      itemVisibility,
      toggleItemVisibility,
      isItemVisible,
      setCategoryItemsVisibility,
      searchQuery,
      setSearchQuery,
      selectedEntity,
      selectEntity,
      getEntityData,
      getSelectedEntityData,
      airplanes,
      airports,
      antennas,
    ]
  );

  return (
    <MapLayersContext.Provider value={value}>
      {children}
    </MapLayersContext.Provider>
  );
}

export function useMapLayers() {
  const context = useContext(MapLayersContext);
  if (!context) {
    throw new Error("useMapLayers must be used within a MapLayersProvider");
  }
  return context;
}
