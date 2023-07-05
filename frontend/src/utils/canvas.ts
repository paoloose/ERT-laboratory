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
    x: Math.ceil(e.pageX - e.currentTarget.offsetLeft),
    y: Math.ceil(e.pageY - e.currentTarget.offsetTop)
  };
}

export function getGridCell(mouseRelativePos: Vec2, state: ERTCanvas): Vec2 {
  return {
    x: Math.floor(mouseRelativePos.x / state.pixe_size),
    y: Math.floor(mouseRelativePos.y / state.pixe_size)
  };
}
