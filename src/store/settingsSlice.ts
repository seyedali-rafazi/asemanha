import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MapStyleId } from "./mapStyles";

export interface SettingsState {
  mapStyleId: MapStyleId;
  airplaneSize: number;
  showAirplaneAltitude: boolean;
}

const initialState: SettingsState = {
  mapStyleId: "balad",
  airplaneSize: 30,
  showAirplaneAltitude: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setMapStyleId(state, action: PayloadAction<MapStyleId>) {
      state.mapStyleId = action.payload;
    },
    setAirplaneSize(state, action: PayloadAction<number>) {
      state.airplaneSize = action.payload;
    },
    setShowAirplaneAltitude(state, action: PayloadAction<boolean>) {
      state.showAirplaneAltitude = action.payload;
    },
    toggleShowAirplaneAltitude(state) {
      state.showAirplaneAltitude = !state.showAirplaneAltitude;
    },
  },
});

export const {
  setMapStyleId,
  setAirplaneSize,
  setShowAirplaneAltitude,
  toggleShowAirplaneAltitude,
} = settingsSlice.actions;

export default settingsSlice.reducer;
