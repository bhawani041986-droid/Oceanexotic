export interface LandmarkEntry {
  name: string;
  lat: number;
  lng: number;
}

export const PORT_BLAIR_LANDMARKS: LandmarkEntry[] = [
  { name: "Phoenix Bay Jetty", lat: 11.6744, lng: 92.7365 },
  { name: "Dollygunj Hub & Junction", lat: 11.635, lng: 92.7079 },
  { name: "Aberdeen Clock Tower", lat: 11.671, lng: 92.741 },
  { name: "Junglighat Fish Landing", lat: 11.6605, lng: 92.728 },
  { name: "Haddo Port", lat: 11.6826, lng: 92.7202 },
  { name: "Bhatubasti Market", lat: 11.632, lng: 92.726 },
  { name: "Minibay Junction", lat: 11.621, lng: 92.715 },
  { name: "Atamphad Crossing", lat: 11.637, lng: 92.703 },
  { name: "Cellular Jail Memorial", lat: 11.6738, lng: 92.7473 },
  { name: "Port Blair Airport (IXZ)", lat: 11.6412, lng: 92.7297 },
  { name: "Chatham Saw Mill & Jetty", lat: 11.685, lng: 92.725 },
  { name: "Rajiv Gandhi Water Sports Complex", lat: 11.6702, lng: 92.7485 }
];

// Haversine distance in meters
export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bearing angle from origin (lat1, lng1) to target landmark (lat2, lng2) in degrees (0-360)
export function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const lam1 = (lng1 * Math.PI) / 180;
  const lam2 = (lng2 * Math.PI) / 180;

  const y = Math.sin(lam2 - lam1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2 - lam1);
  const theta = Math.atan2(y, x);
  return ((theta * 180) / Math.PI + 360) % 360;
}

// 8-Point Relative Position Classifier: Opposite to, Right side of, Left side of, Behind
export function getPreciseDirectionalLandmark(lat: number, lng: number, placeName?: string): string {
  let minDistance = Infinity;
  let closest: LandmarkEntry = PORT_BLAIR_LANDMARKS[0];

  PORT_BLAIR_LANDMARKS.forEach((lm) => {
    const dist = getDistanceMeters(lat, lng, lm.lat, lm.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = lm;
    }
  });

  const metersRounded = Math.round(minDistance);
  const bearing = getBearing(lat, lng, closest.lat, closest.lng);

  let positionPrefix = "Near";
  let cardinal = "North";

  if (bearing >= 337.5 || bearing < 22.5) {
    positionPrefix = "Opposite to";
    cardinal = "North";
  } else if (bearing >= 22.5 && bearing < 67.5) {
    positionPrefix = "Right side of";
    cardinal = "North-East";
  } else if (bearing >= 67.5 && bearing < 112.5) {
    positionPrefix = "Right side of";
    cardinal = "East";
  } else if (bearing >= 112.5 && bearing < 157.5) {
    positionPrefix = "Behind";
    cardinal = "South-East";
  } else if (bearing >= 157.5 && bearing < 202.5) {
    positionPrefix = "Opposite to";
    cardinal = "South";
  } else if (bearing >= 202.5 && bearing < 247.5) {
    positionPrefix = "Left side of";
    cardinal = "South-West";
  } else if (bearing >= 247.5 && bearing < 292.5) {
    positionPrefix = "Left side of";
    cardinal = "West";
  } else {
    positionPrefix = "Opposite to";
    cardinal = "North-West";
  }

  const distanceText = metersRounded < 1000 ? `${metersRounded}m` : `${(metersRounded / 1000).toFixed(1)}km`;
  const baseLandmark = placeName ? placeName.split(",")[0] : closest.name;

  return `${positionPrefix} ${baseLandmark} (~${distanceText} ${cardinal})`;
}
