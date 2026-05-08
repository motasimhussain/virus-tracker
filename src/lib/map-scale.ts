const HEAT_COLORS = [
  "rgba(34,211,238,0.35)",
  "rgba(250,204,21,0.45)",
  "rgba(249,115,22,0.55)",
  "rgba(239,68,68,0.65)",
];

export function getHeatColor(value: number, max: number): string {
  if (max <= 0) return HEAT_COLORS[0];
  const ratio = value / max;
  if (ratio >= 0.75) return HEAT_COLORS[3];
  if (ratio >= 0.5) return HEAT_COLORS[2];
  if (ratio >= 0.25) return HEAT_COLORS[1];
  return HEAT_COLORS[0];
}

export function projectToWorldMap(latitude: number, longitude: number, width: number, height: number) {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return { x, y };
}
