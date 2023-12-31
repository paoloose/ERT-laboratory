import { create } from 'zustand';
import { yeet } from '@/utils/assertions';
import { Resistivity } from '@/types';

// All tools classes will implement CanvasToolBase
interface CanvasToolBase {
  readonly displayName: string;
  readonly name: string;
  readonly icon: string;
}

export class PencilTool implements CanvasToolBase {
  readonly displayName = 'Lapiz de resistividad';
  readonly name = 'pencil';
  readonly icon = '✏️';
  sizeMeters = 1;
}

// NOTE: when hot-reloading this, resitivity colors change without sense
export class EraserTool implements CanvasToolBase {
  readonly displayName = 'Borrador';
  readonly name = 'eraser';
  readonly icon = '🧽';
  sizeMeters = 2;
}

type CanvasToolMap = {
  'pencil': typeof PencilTool,
  'eraser': typeof EraserTool
};

type CanvasTool = InstanceType<CanvasToolMap[keyof CanvasToolMap]>;

type ResistivityBrush = {
  name: string;
  value: Resistivity;
};

export type DrawingState = {
  tools: CanvasTool[],
  selectedTool: CanvasTool, // a references to one of the tools in the tools array

  resistivities: ResistivityBrush[],
  selectedResistivity: ResistivityBrush,

  setTool: (tool_name: keyof CanvasToolMap) => void;
  setResistivity: (color: ResistivityBrush) => void;
};

export const useDrawingStore = create<DrawingState>()(
  (set, get) => {
    const initialTools = [new PencilTool(), new EraserTool()];
    const initialResistivities = [
      { name: 'Roca', value: 1700 },
      { name: 'Laterita', value: 1200 },
      { name: 'Caliza', value: 600 },
      { name: 'Arcilla', value: 500 },
      { name: 'Arena', value: 200 },
      { name: 'Agua', value: 50 },
      { name: 'Oro (Au)', value: 0.0244 },
      { name: 'Cobre (Cu)', value: 0.068 }
    ];
    const INITIAL_TOOL = initialTools[0].name;
    const INITIAL_COLOR = initialResistivities[0].value;

    return {
      resistivities: initialResistivities,
      selectedResistivity: initialResistivities.find((resistivity) => resistivity.value === INITIAL_COLOR) ?? yeet('useDrawingStore: Initial color should be defined'),
      tools: initialTools,
      selectedTool: initialTools.find((tool) => tool.name === INITIAL_TOOL) ?? yeet('useDrawingStore: Initial tool should be defined'),
      setTool: (toolName) => {
        set({
          selectedTool: get().tools.find((tool) => tool.name === toolName) ?? yeet('useDrawingStore: Tool should exist')
        });
      },
      setResistivity: (resistivity) => {
        set({
          selectedResistivity: get().resistivities.find((r) => r.value === resistivity.value) ?? yeet('useDrawingStore: Color should exist')
        });
      }
    };
  }
);
