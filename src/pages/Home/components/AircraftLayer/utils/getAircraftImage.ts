const AIRCRAFT_IMAGES: Record<string, string> = {
  A310: "/images/aircraft/wide-body.svg",
  A320: "/images/aircraft/narrow-body.svg",
  A321: "/images/aircraft/narrow-body.svg",
  A330: "/images/aircraft/wide-body.svg",
  B737: "/images/aircraft/narrow-body.svg",
  B747: "/images/aircraft/jumbo.svg",
  B777: "/images/aircraft/wide-body.svg",
  "MD-83": "/images/aircraft/narrow-body.svg",
  F100: "/images/aircraft/regional.svg",
  ERJ: "/images/aircraft/regional.svg",
};

const DEFAULT_IMAGE = "/images/aircraft/default.svg";

export function getAircraftImage(aircraftType: string): string {
  return AIRCRAFT_IMAGES[aircraftType] ?? DEFAULT_IMAGE;
}
