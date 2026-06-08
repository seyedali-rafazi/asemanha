export type MapStyleId = "balad" | "streets" | "dark" | "satellite";

export interface MapStyleOption {
  id: MapStyleId;
  label: string;
  url: string;
}

export const MAP_STYLE_OPTIONS: MapStyleOption[] = [
  {
    id: "balad",
    label: "Balad",
    url: "https://tiles.raah.ir/dynamic/new_style_preview.json",
  },
  {
    id: "streets",
    label: "Streets",
    url: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "dark",
    label: "Dark",
    url: "mapbox://styles/mapbox/dark-v11",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];

export function getMapStyleUrl(id: MapStyleId): string {
  return MAP_STYLE_OPTIONS.find((s) => s.id === id)?.url ?? MAP_STYLE_OPTIONS[0].url;
}
