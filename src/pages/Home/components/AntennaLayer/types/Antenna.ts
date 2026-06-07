export interface Antenna {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  frequency: string;
  range_km: number;
  operator: string;
  status: "active" | "inactive";
}
