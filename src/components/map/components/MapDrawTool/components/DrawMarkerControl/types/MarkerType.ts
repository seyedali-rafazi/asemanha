import type { Dispatch, SetStateAction } from "react";
import type { ToolProps } from "../../../../../types/MapTypes";

export interface MarkerButtonProps extends ToolProps {
  isDrawing: boolean;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
}

export interface MarkerLogicProps {
  isDrawing: boolean;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
}
