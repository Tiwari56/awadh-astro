import type { PlanetPosition } from "@/types";

/**
 * Classic North Indian Vedic birth chart (square + both diagonals + the
 * diamond connecting each side's midpoint) — the same 12-region layout every
 * Vedic astrology site uses. House 1 (Lagna) is always the top kite shape;
 * houses run clockwise from there. Coordinates below are independently
 * derived from the chart's actual construction (not eyeballed) — see the
 * geometry note at the bottom of this file if this ever needs editing.
 */

const PLANET_ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke",
};

function abbr(planet: string): string {
  return PLANET_ABBR[planet.toLowerCase()] ?? planet.slice(0, 2);
}

// Key construction points (300x300 coordinate space).
const O: [number, number] = [150, 150]; // center
const A: [number, number] = [0, 0], B: [number, number] = [300, 0];
const C: [number, number] = [300, 300], D: [number, number] = [0, 300];
const T: [number, number] = [150, 0], R: [number, number] = [300, 150];
const Bm: [number, number] = [150, 300], L: [number, number] = [0, 150];
const X1: [number, number] = [225, 75], X2: [number, number] = [225, 225];
const X3: [number, number] = [75, 225], X4: [number, number] = [75, 75];

// House 1..12 polygons (house 1 = top kite, then clockwise) + a label anchor point per house.
const HOUSES: { points: [number, number][]; label: [number, number] }[] = [
  { points: [O, X4, T, X1], label: [150, 55] },   // 1 — top kite
  { points: [T, B, X1], label: [205, 30] },        // 2
  { points: [X1, B, R], label: [255, 80] },        // 3
  { points: [O, X1, R, X2], label: [245, 150] },   // 4 — right kite
  { points: [R, C, X2], label: [255, 220] },       // 5
  { points: [X2, C, Bm], label: [205, 270] },      // 6
  { points: [O, X2, Bm, X3], label: [150, 245] },  // 7 — bottom kite
  { points: [Bm, D, X3], label: [95, 270] },       // 8
  { points: [X3, D, L], label: [45, 220] },        // 9
  { points: [O, X3, L, X4], label: [55, 150] },    // 10 — left kite
  { points: [L, A, X4], label: [45, 80] },         // 11
  { points: [X4, A, T], label: [95, 30] },         // 12
];

const OUTLINE = [A, B, C, D].map((p) => p.join(",")).join(" ");

export default function NorthIndianChart({
  ascendant,
  planets,
}: {
  ascendant: string;
  planets: PlanetPosition[];
}) {
  const byHouse = new Map<number, PlanetPosition[]>();
  for (const p of planets) {
    if (!byHouse.has(p.house)) byHouse.set(p.house, []);
    byHouse.get(p.house)!.push(p);
  }

  return (
    <svg viewBox="0 0 300 300" className="kundli-chart" role="img" aria-label={`North Indian birth chart, Ascendant ${ascendant}`}>
      <polygon points={OUTLINE} className="chart-outline" />
      <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} className="chart-line" />
      <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} className="chart-line" />
      <polygon points={[T, R, Bm, L].map((p) => p.join(",")).join(" ")} className="chart-line-fill" />

      {HOUSES.map((h, i) => {
        const houseNum = i + 1;
        const occupants = byHouse.get(houseNum) ?? [];
        return (
          <g key={houseNum}>
            {houseNum === 1 && (
              <text x={h.label[0]} y={h.label[1] - 16} textAnchor="middle" className="chart-asc-label">
                Asc
              </text>
            )}
            <text x={h.label[0]} y={h.label[1]} textAnchor="middle" className="chart-house-num">
              {houseNum}
            </text>
            {occupants.map((p, j) => (
              <text
                key={p.planet}
                x={h.label[0]}
                y={h.label[1] + 16 + j * 14}
                textAnchor="middle"
                className={`chart-planet${p.retrograde ? " chart-planet-retro" : ""}`}
              >
                {abbr(p.planet)}{p.retrograde ? "℞" : ""}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Geometry note: the square (0,0)-(300,300) with both diagonals and the
 * diamond joining side-midpoints creates 4 "kite" quadrilaterals at the
 * diamond's points (houses 1/4/7/10, the kendras) and 8 triangles in the
 * square's corners (2 per corner). Each corner's 2 triangles are split by
 * the square's diagonal passing through that corner. Intersection points:
 *   X1=(225,75) diagonal B–D × diamond edge T–R
 *   X2=(225,225) diagonal A–C × diamond edge R–Bm
 *   X3=(75,225) diagonal B–D × diamond edge Bm–L
 *   X4=(75,75) diagonal A–C × diamond edge L–T
 */
