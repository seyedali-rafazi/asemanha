const AIRCRAFT_IMAGES: Record<string, string> = {
  A310: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
  A320: "https://images.unsplash.com/photo-1556388150-ded2f0dbfc6b?w=600&h=400&fit=crop",
  A321: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop",
  A330: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=400&fit=crop",
  B737: "https://images.unsplash.com/photo-1556388150-ded2f0dbfc6b?w=600&h=400&fit=crop",
  B747: "https://images.unsplash.com/photo-1464037864646-9e68dd167a88?w=600&h=400&fit=crop",
  B777: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&h=400&fit=crop",
  "MD-83": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop",
  F100: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop",
  ERJ: "https://images.unsplash.com/photo-1556388150-ded2f0dbfc6b?w=600&h=400&fit=crop",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop";

export function getAircraftImage(aircraftType: string): string {
  return AIRCRAFT_IMAGES[aircraftType] ?? DEFAULT_IMAGE;
}
