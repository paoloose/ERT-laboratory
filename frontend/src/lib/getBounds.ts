import { Vec2Pair } from '@/types';

export function getBounds(points: Vec2Pair[]): [Vec2Pair, Vec2Pair] {
  const n = points.length;
  if (n === 0) {
    return [[0, 0], [0, 0]];
  }
  const d = points[0].length;
  const lo = points[0].slice() as Vec2Pair;
  const hi = points[0].slice() as Vec2Pair;

  for (let i = 1; i < n; i++) {
    const p = points[i];
    for (let j = 0; j < d; j++) {
      const x = p[j];
      lo[j] = Math.min(lo[j], x);
      hi[j] = Math.max(hi[j], x);
    }
  }
  return [lo, hi];
}
