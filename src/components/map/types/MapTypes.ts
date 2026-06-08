export type MapTool =
  | "flyHome"
  | "zoom"
  | "locateUser"
  | "boxZoom"
  | "draw"
  | "marker"
  | "line"
  | "freedraw"
  | "extra"
  | "view"
  | null;

export interface ToolProps {
  activeTool: MapTool;
  setActiveTool: React.Dispatch<React.SetStateAction<MapTool>>;
}
