import iconMapping from "../icon/aircraftIconMapping.json" with { type: "json" };

export type AircraftIconCategory =
  | "commercial_airliner"
  | "large_passenger"
  | "small_passenger"
  | "business_jet"
  | "cargo"
  | "helicopter"
  | "military"
  | "turboprop"
  | "unknown";

export interface AircraftIconInput {
  aircraftType?: string;
  aircraft_icao?: string;
  category?: number;
  model?: string;
  manufacturer?: string;
}

const AVAILABLE = new Set(Object.keys(iconMapping));

/** Common non-ICAO or family aliases → atlas icon ids */
const TYPE_ALIASES: Record<string, string> = {
  // Narrow-body commercial
  A319: "A320",
  "319": "A320",
  "320": "A320",
  "321": "A321",
  B737: "B738",
  "737": "B738",
  "738": "B738",
  "739": "B739",
  "747": "B744",
  "777": "B77W",
  "787": "B789",
  "380": "A388",
  A380: "A388",
  B747: "B744",
  B777: "B77W",
  B787: "B789",
  // Regional
  E175: "E170",
  E190: "E195",
  ERJ: "E170",
  CRJ: "CRJ9",
  // Business
  GLF5: "GLF6",
  GLEX: "GL5T",
  CL60: "C25B",
  C56X: "C25B",
  C680: "C750",
  LJ45: "LJ35",
  LJ60: "LJ35",
  // Helicopters
  H135: "EC35",
  H145: "EC45",
  EC130: "EC35",
  B407: "R44",
  B206: "R44",
  // Turboprop
  DH8A: "DH8C",
  DH8B: "DH8C",
  Q400: "DH8D",
  AT72: "AT75",
  AT76: "AT75",
  // Cargo / military transport
  A400M: "A400",
  C17A: "C17",
  // Misc UI labels from demo data
  F100: "RJ85",
  "MD-83": "B722",
  MD83: "B722",
};

const HELICOPTER_PREFIXES = [
  "EC",
  "AS3",
  "AS6",
  "H47",
  "H60",
  "H64",
  "UH1",
  "R44",
  "MI2",
  "S61",
  "NH9",
  "LYNX",
  "GAZL",
  "GYRO",
  "TIGR",
];

const MILITARY_PREFIXES = [
  "F15",
  "F16",
  "F18",
  "F22",
  "F35",
  "F5",
  "EUFI",
  "RFAL",
  "HAWK",
  "TOR",
  "A10",
  "B1",
  "B52",
  "C17",
  "C5",
  "E3",
  "E8",
  "P3",
  "P8",
  "U2",
  "VF35",
  "SB39",
  "MRF1",
  "L159",
  "M326",
  "T38",
  "HUNT",
  "AJET",
];

const BUSINESS_PREFIXES = [
  "C25",
  "C56",
  "C68",
  "C75",
  "FA7",
  "GLF",
  "GL5",
  "LJ",
  "E35",
  "E55",
  "CL3",
  "CL6",
  "P180",
];

const TURBOPROP_PREFIXES = [
  "DH8",
  "AT4",
  "AT7",
  "SF3",
  "B190",
  "PC12",
  "PC6",
  "C208",
  "D228",
  "D328",
  "AN26",
  "AN12",
  "F50",
  "ATP",
  "BN2",
  "BE2",
  "BE3",
];

const CARGO_CODES = new Set([
  "A124",
  "A225",
  "A3ST",
  "BLCF",
  "C130",
  "C160",
  "C17",
  "C5M",
  "IL76",
  "AN12",
  "MD11",
  "DC10",
  "B74S",
]);

const LARGE_PASSENGER_PREFIXES = [
  "A33",
  "A34",
  "A35",
  "A38",
  "B74",
  "B77",
  "B78",
  "A30",
  "A31",
];

function normalizeTypeCode(raw?: string): string {
  if (!raw) return "";
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function candidateCodes(raw?: string): string[] {
  const cleaned = normalizeTypeCode(raw);
  if (!cleaned) return [];

  const out: string[] = [];
  const push = (v: string) => {
    if (v && !out.includes(v)) out.push(v);
  };

  push(cleaned);
  if (cleaned.length > 4) {
    push(cleaned.slice(0, 4));
    push(cleaned.slice(0, 3));
  }
  if (TYPE_ALIASES[cleaned]) push(TYPE_ALIASES[cleaned]);
  if (cleaned.length >= 4 && TYPE_ALIASES[cleaned.slice(0, 4)]) {
    push(TYPE_ALIASES[cleaned.slice(0, 4)]);
  }

  return out;
}

function firstAvailable(candidates: string[]): string | null {
  for (const id of candidates) {
    if (AVAILABLE.has(id)) return id;
  }
  return null;
}

function startsWithAny(code: string, prefixes: string[]): boolean {
  return prefixes.some((p) => code.startsWith(p));
}

/**
 * Infer a coarse visual category when no exact ICAO icon exists.
 */
export function resolveAircraftIconCategory(
  input: AircraftIconInput
): AircraftIconCategory {
  const code =
    normalizeTypeCode(input.aircraft_icao) ||
    normalizeTypeCode(input.aircraftType) ||
    normalizeTypeCode(input.model);

  if (code) {
    if (CARGO_CODES.has(code) || startsWithAny(code, ["IL76", "A124", "A225"])) {
      return "cargo";
    }
    if (startsWithAny(code, HELICOPTER_PREFIXES)) return "helicopter";
    if (startsWithAny(code, MILITARY_PREFIXES)) return "military";
    if (startsWithAny(code, BUSINESS_PREFIXES)) return "business_jet";
    if (startsWithAny(code, TURBOPROP_PREFIXES)) return "turboprop";
    if (startsWithAny(code, LARGE_PASSENGER_PREFIXES)) return "large_passenger";
    if (
      startsWithAny(code, ["CRJ", "E17", "E19", "E70", "AT7", "DH8", "SF3", "RJ"])
    ) {
      return "small_passenger";
    }
    if (startsWithAny(code, ["A31", "A32", "B73", "BCS", "A20", "A21"])) {
      return "commercial_airliner";
    }
  }

  // ADS-B emitter category (common OpenSky / DO-260B integer mapping)
  switch (input.category) {
    case 7:
      return "helicopter";
    case 5:
    case 4:
      return "large_passenger";
    case 3:
      return "commercial_airliner";
    case 2:
      return "small_passenger";
    case 1:
      return "small_passenger";
    case 6:
      return "military";
    case 8:
      return "unknown";
    case 13:
      return "military";
    default:
      break;
  }

  const blob = `${input.manufacturer ?? ""} ${input.model ?? ""} ${input.aircraftType ?? ""}`.toLowerCase();
  if (/heli|rotor/.test(blob)) return "helicopter";
  if (/cargo|freighter/.test(blob)) return "cargo";
  if (/fighter|military|bomber/.test(blob)) return "military";
  if (/business|gulfstream|citation|learjet|falcon|global/.test(blob)) {
    return "business_jet";
  }
  if (/turboprop|dash.?8|atr|q400/.test(blob)) return "turboprop";
  if (/a380|a350|a330|a340|747|777|787|wide.?body|jumbo/.test(blob)) {
    return "large_passenger";
  }
  if (/a320|a321|a319|737|narrow/.test(blob)) return "commercial_airliner";

  return "unknown";
}

/**
 * Resolve the atlas icon id for an aircraft.
 * Prefer exact ICAO type icons, then category silhouettes, then Unidentified.
 */
export function resolveAircraftIconId(input: AircraftIconInput): string {
  const exact = firstAvailable([
    ...candidateCodes(input.aircraft_icao),
    ...candidateCodes(input.aircraftType),
    ...candidateCodes(input.model),
  ]);
  if (exact) return exact;

  const category = resolveAircraftIconCategory(input);
  if (AVAILABLE.has(category)) return category;
  if (AVAILABLE.has("unknown")) return "unknown";
  if (AVAILABLE.has("Unidentified")) return "Unidentified";
  return "commercial_airliner";
}

export function getAircraftIconMapping() {
  return iconMapping as Record<
    string,
    {
      x: number;
      y: number;
      width: number;
      height: number;
      anchorX: number;
      anchorY: number;
    }
  >;
}

export const AIRCRAFT_ATLAS_URL = "/aircraft/aircraft-atlas.png";
