// from: https://www.npmjs.com/package/normalize-path-scale
import { Vec2Pair } from '@/types';
import { getBounds } from '@/lib/getBounds';

function unlerp(min: number, max: number, value: number) {
  return (value - min) / (max - min);
}

export function normalizePath(positions: Vec2Pair[]) {
  const normalized = positions.slice();
  const bounds = getBounds(normalized);
  const min = bounds[0];
  const max = bounds[1];

  const width = max[0] - min[0];
  const height = max[1] - min[1];

  const aspectX = width > height ? 1 : (height / width);
  const aspectY = width > height ? (width / height) : 1;

  if (max[0] - min[0] === 0 || max[1] - min[1] === 0) {
    return normalized; // div by zero; leave positions unchanged
  }

  for (let i = 0; i < positions.length; i++) {
    normalized[i][0] = (unlerp(min[0], max[0], normalized[i][0]) * 2 - 1) / aspectX;
    normalized[i][1] = (unlerp(min[1], max[1], normalized[i][1]) * 2 - 1) / aspectY;
  }
  return positions;
}
