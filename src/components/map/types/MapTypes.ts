export type MapTool =
  | "flyHome"
  | "zoom"
  | "locateUser"
  | "boxZoom"
  | "draw"
  | "extra"
  | "view"
  | null;

export interface ToolProps {
  activeTool: MapTool;
  setActiveTool: React.Dispatch<React.SetStateAction<MapTool>>;
}
