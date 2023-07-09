import { create } from 'zustand';
import { Resistivity, Vec2Pair } from '@/types';

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
    // TODO: get this from App.tsx specification
    // const { x, y } = canvasInitialState.worldSizeMeters;
    const { x, y } = { x: 100, y: 50 };
    const initialCanvasData = Array(y + 1).fill(null).map(() => Array(x + 1).fill(0));

    return {
      canvasData: initialCanvasData,
      parsedShapes: []
    };
  }
);
