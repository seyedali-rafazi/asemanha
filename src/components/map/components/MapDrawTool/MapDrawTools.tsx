// src/components/ExpandableToolbar/ExpandableVerticalToolbar.jsx
import { useState } from "react";
import ExpandableBox from "../../../utils/MapTools/ExpandableBox";
import DrawCircleControl from "./components/DrawCircleControl/DrawCircleControl";
import DrawLineControl from "./components/DrawLineControl/DrawLineControl";
import DrawMarkerControl from "./components/DrawMarkerControl/DrawMarkerControl";
import DrawPolygonControl from "./components/DrawPolygonControl/DrawPolygonControl";
import DrawRectangleControl from "./components/DrawRectangleControl/DrawRectangleControl";
import FreeDrawControl from "./components/FreeDrawControl/FreeDrawControl";
import IntersectionControl from "./components/IntersectionControl/IntersectionControl";
import CreateIcon from "@mui/icons-material/Create";

const MapDrawTools = () => {
  return (
    <ExpandableBox
      id="draw"
      accordionText="DRAW"
      accordionIcon={
        <CreateIcon
          sx={{
            fontSize: 20,
            color: "text.secondary",
          }}
        />
      }
    >
      <DrawMarkerControl />
      <DrawLineControl />
      <FreeDrawControl />
      <DrawRectangleControl />
      <DrawPolygonControl />
      <DrawCircleControl />
      <IntersectionControl />
    </ExpandableBox>
  );
};

export default MapDrawTools;
