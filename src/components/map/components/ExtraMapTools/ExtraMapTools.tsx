import { Architecture } from "@mui/icons-material";
import ExpandableBox from "../../../utils/MapTools/ExpandableBox";
import GoToControl from "./components/GoToControl/GoToControl";
import DrawRulerControl from "./components/DrawRulerControl/DrawRulerControl";
import ImageOverlayControl from "./components/ImageOverlayControl/ImageOverlayControl";
import CaptureAreaControl from "./components/CaptureAreaControl/CaptureAreaControl";

const ExtraMapTools = () => {
  return (
    <ExpandableBox
      accordionText="TOOL"
      accordionIcon={
        <Architecture
          sx={{
            fontSize: 20,
            color: "text.secondary",
          }}
        />
      }
    >
      <GoToControl />
      <DrawRulerControl />
      <ImageOverlayControl />
      <CaptureAreaControl />
    </ExpandableBox>
  );
};

export default ExtraMapTools;
