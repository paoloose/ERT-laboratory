import tinygradient from 'tinygradient';
import { useDrawingStore } from '@/stores/drawingStore';
import { yeet } from '@/utils/assertions';
import colormap from '@/data/color_maps.json';
import { Resistivity } from '@/types';

const gradient = tinygradient(colormap.Spectral.reverse().map((color) => ({
  r: color[0] * 255,
  g: color[1] * 255,
  b: color[2] * 255
})));

const colorsDict: Map<Resistivity, string> = new Map();

export function getColorFromResistivity(resistivity: Resistivity) {
  if (resistivity === 0) return '#637548';
  if (colorsDict.has(resistivity)) {
    return colorsDict.get(resistivity) ?? yeet('unreachable');
  }

  const resValues = useDrawingStore.getState().resistivities.map((r) => r.value);
  const min = 0;
  const max = Math.max(...resValues);
  const percentage = (resistivity - min) / (max - min);
  const color = gradient.rgbAt(percentage).toHexString();

  colorsDict.set(resistivity, color);

  return color;
}
