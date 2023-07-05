import colormap from '@/data/color_maps.json';
import { useDrawingStore } from '@/stores/drawingStore';
import { yeet } from '@/utils/assertions';

const COLOR_MAP = colormap.Spectral.reverse();

const colorsDict: Map<number, string> = new Map();

export function getColorFromResistivity(resistivity: number) {
  if (colorsDict.has(resistivity)) {
    return colorsDict.get(resistivity) ?? yeet('unreachable');
  }

  const resValues = useDrawingStore.getState().resistivities.map((r) => r.value);
  const min = Math.min(...resValues);
  const max = Math.max(...resValues);
  const percentage = (resistivity - min) / (max - min);
  const colorIndex = Math.floor(percentage * COLOR_MAP.length) - 1;

  const [r, g, b] = COLOR_MAP[colorIndex < 0 ? 0 : colorIndex];
  const color = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
  colorsDict.set(resistivity, color);

  return color;
}
