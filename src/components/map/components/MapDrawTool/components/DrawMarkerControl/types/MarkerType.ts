import type { Dispatch, SetStateAction } from "react";

export interface MarkerButtonProps {
  isDrawing: boolean;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
}

export interface MarkerLogicProps {
  isDrawing: boolean;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
}
