import { create } from 'zustand';
import { ERTCanvasConfig, Resistivity, Vec2Pair } from '@/types';
import { canvasToShapes } from '@/lib/canvasToShapes';

export const CANVAS_DATA_LOCAL_STORAGE_ID = 'canvas_data';

export const canvasConfig: ERTCanvasConfig = {
  isDragging: false,
  canvasDimensions: { x: 400, y: 200 },
  worldSizeMeters: { x: 50, y: 25 }, // 50mx100m
  gridSizeMeters: 0.5, // 1m
  lastMouse: { x: 0, y: 0 }
};

export type SubsurfaceShape = {
  resistivity: number,
  nodes: Vec2Pair[];
};

export type DrawingState = {
  canvasData: Resistivity[][],
  parsedShapes: SubsurfaceShape[]
};

export const useCanvasStore = create<DrawingState>()(
  (/* set, get */) => {
    // TODO: retrieve from LocalStorage and parse on start
    // const { x, y } = canvasInitialState.worldSizeMeters;
    const x = canvasConfig.worldSizeMeters.x / canvasConfig.gridSizeMeters;
    const y = canvasConfig.worldSizeMeters.y / canvasConfig.gridSizeMeters;

    const storedCanvas = JSON.parse(
      window.localStorage.getItem(CANVAS_DATA_LOCAL_STORAGE_ID) || 'null'
    ) as Resistivity[][] | null;

    const initialCanvasData = (
      storedCanvas ?? Array(y + 1).fill(null).map(() => Array(x + 1).fill(0))
    ) as Resistivity[][];

    return {
      canvasData: initialCanvasData,
      parsedShapes: canvasToShapes(initialCanvasData)
    };
  }
);
