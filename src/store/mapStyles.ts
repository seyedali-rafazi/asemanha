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
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "/styles/satellite.json",
  },
];

export function getMapStyleUrl(id: MapStyleId): string {
  return MAP_STYLE_OPTIONS.find((s) => s.id === id)?.url ?? MAP_STYLE_OPTIONS[0].url;
}
