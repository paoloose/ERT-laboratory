import { create } from 'zustand';
import { yeet } from '@/utils/assertions';

export class PencilTool implements CanvasToolBase {
  readonly name = 'pencil';
  readonly icon = '✏️';
}

export class EraserTool implements CanvasToolBase {
  readonly name = 'eraser';
  readonly icon = '🧽';
}

type CanvasToolMap = {
  'pencil': typeof PencilTool,
  'eraser': typeof EraserTool
};

type CanvasTool = InstanceType<CanvasToolMap[keyof CanvasToolMap]>;

export type DrawingState = {
  tools: CanvasTool[],
  selected_tool: CanvasTool, // a references to one of the tools in the tools array

  resistivities: ResistivityBrush[],
  selected_resistivity: ResistivityBrush,

  setTool: (tool_name: keyof CanvasToolMap) => void;
  setResistivity: (color: ResistivityBrush) => void;
};

export const useDrawingStore = create<DrawingState>()(
  (set, get) => {
    const initialTools = [new PencilTool(), new EraserTool()];
    const initialResistivities = [
      { name: 'limestone', value: 600 },
      { name: 'sand', value: 200 },
      { name: 'water', value: 50 }
    ];
    const INITIAL_TOOL = initialTools[0].name;
    const INITIAL_COLOR = initialResistivities[0].value;

    return {
      resistivities: initialResistivities,
      selected_resistivity: initialResistivities.find((resistivity) => resistivity.value === INITIAL_COLOR) ?? yeet('useDrawingStore: Initial color should be defined'),
      tools: initialTools,
      selected_tool: initialTools.find((tool) => tool.name === INITIAL_TOOL) ?? yeet('useDrawingStore: Initial tool should be defined'),
      setTool: (tool_name) => {
        set({
          selected_tool: get().tools.find((tool) => tool.name === tool_name) ?? yeet('useDrawingStore: Tool should exist')
        });
      },
      setResistivity: (resistivity) => {
        set({
          selected_resistivity: get().resistivities.find((r) => r.value === resistivity.value) ?? yeet('useDrawingStore: Color should exist')
        });
      }
    };
  }
);
