export interface AircraftVisual {
  gradient: string;
  accent: string;
}

const CATEGORY_VISUALS: Record<string, AircraftVisual> = {
  jumbo: {
    gradient: "linear-gradient(135deg, #2b1d4e 0%, #5b3fa8 58%, #8b6cd9 100%)",
    accent: "#c4b1f5",
  },
  wide: {
    gradient: "linear-gradient(135deg, #0d2b3e 0%, #14628a 58%, #2f9bc4 100%)",
    accent: "#8fd3ef",
  },
  narrow: {
    gradient: "linear-gradient(135deg, #14233b 0%, #2a4d7a 58%, #4f86c6 100%)",
    accent: "#9cc2ee",
  },
  regional: {
    gradient: "linear-gradient(135deg, #10302b 0%, #1f6e5c 58%, #3fb59a 100%)",
    accent: "#8fe6d2",
  },
  default: {
    gradient: "linear-gradient(135deg, #1b1f24 0%, #34414f 58%, #5a6b7d 100%)",
    accent: "#aebccb",
  },
};

const TYPE_CATEGORY: Record<string, keyof typeof CATEGORY_VISUALS> = {
  A310: "wide",
  A330: "wide",
  B777: "wide",
  B747: "jumbo",
  A320: "narrow",
  A321: "narrow",
  B737: "narrow",
  "MD-83": "narrow",
  F100: "regional",
  ERJ: "regional",
};

export function getAircraftVisual(aircraftType: string): AircraftVisual {
  const category = TYPE_CATEGORY[aircraftType] ?? "default";
  return CATEGORY_VISUALS[category];
}
