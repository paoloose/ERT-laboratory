import { CanvasPointerEvent, ERTCanvas, Vec2 } from '@/types';

export function getCanvasContext2D(
  canvas: HTMLCanvasElement | null
): CanvasRenderingContext2D | null {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return ctx;
}

export function getRelativeMousePos(e: CanvasPointerEvent) {
  return {
    x: Math.floor(e.pageX - e.currentTarget.offsetLeft),
    y: Math.floor(e.pageY - e.currentTarget.offsetTop)
  };
}

export function getGridCell(mouseRelativePos: Vec2, state: ERTCanvas): Vec2 {
  return {
    x: Math.floor(
      (mouseRelativePos.x / state.canvasDimensions.x)
      * (state.worldSizeMeters.x / state.gridSizeMeters)
    ),
    y: Math.floor(
      (mouseRelativePos.y / state.canvasDimensions.y)
      * (state.worldSizeMeters.y / state.gridSizeMeters)
    )
  };
}

export function metersToPx(meters: number, state: ERTCanvas) {
  return (state.canvasDimensions.x / state.worldSizeMeters.x) * meters;
}
